import { NextResponse } from 'next/server';
import { verifyAuth } from '../../../../lib/middleware/auth';
import { connectToDatabase } from '../../../../lib/mongodb';
import Task from '../../../../models/Task';
import Note from '../../../../models/Note';
import Career from '../../../../models/Career';
import Research from '../../../../models/Research';
import Project from '../../../../models/Project';
import Habit from '../../../../models/Habit';
import Goal from '../../../../models/Goal';
import { AgentActionProposal } from '../../../../lib/agent/types';

export async function POST(req: Request) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.authenticated) return auth.response;

    const body = await req.json();
    const action: AgentActionProposal = body.actionProposal;

    if (!action || !action.module || !action.opType) {
      return NextResponse.json({ error: 'Invalid AgentActionProposal payload' }, { status: 400 });
    }

    await connectToDatabase();
    const userId = auth.user.userId;
    let executedData: unknown = null;

    switch (action.module) {
      case 'notes': {
        if (action.opType === 'CREATE') {
          executedData = await Note.create({
            userId,
            title: action.targetData.title || action.title,
            content: action.targetData.content || '',
            tags: action.targetData.tags || ['co-pilot'],
            folder: action.targetData.folder || 'General',
            pinned: false
          });
        } else if (action.opType === 'UPDATE' && action.entityId) {
          executedData = await Note.findOneAndUpdate(
            { _id: action.entityId, userId },
            { $set: action.targetData.updates || {} },
            { new: true }
          );
        } else if (action.opType === 'DELETE' && action.entityId) {
          executedData = await Note.findOneAndDelete({ _id: action.entityId, userId });
        }
        break;
      }

      case 'tasks': {
        if (action.opType === 'CREATE') {
          executedData = await Task.create({
            _id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            userId,
            title: action.targetData.title || action.title,
            category: action.targetData.category || 'General',
            estimatedHours: action.targetData.estimatedHours || 1.0,
            priority: action.targetData.priority || 'medium',
            mit: action.targetData.mit || false,
            timeSlot: action.targetData.timeSlot || 'afternoon',
            dueDate: new Date().toISOString().split('T')[0],
            status: 'todo'
          });
        } else if (action.opType === 'UPDATE') {
          if (action.entityId) {
            executedData = await Task.findOneAndUpdate(
              { _id: action.entityId, userId },
              { $set: action.targetData },
              { new: true }
            );
          } else {
            const searchTitle = String(action.targetData?.title || action.targetData?.prompt || '').replace(/["']/g, '').trim();
            if (searchTitle) {
              executedData = await Task.findOneAndUpdate(
                { userId, title: { $regex: searchTitle, $options: 'i' } },
                { $set: action.targetData },
                { new: true }
              );
            }
          }
        } else if (action.opType === 'DELETE') {
          if (action.entityId) {
            executedData = await Task.findOneAndDelete({ _id: action.entityId, userId });
          } else {
            const rawTarget = String(action.targetData?.title || action.targetData?.prompt || '');
            const cleanTitle = rawTarget
              .replace(/["']/g, '')
              .replace(/^(delete|remove)\s+/i, '')
              .replace(/\s*(task|from today's task|today)\s*/gi, '')
              .trim();

            if (cleanTitle) {
              executedData = await Task.deleteMany({
                userId,
                title: { $regex: cleanTitle, $options: 'i' }
              });
            }
          }
        }
        break;
      }

      case 'career': {
        const todayStr = new Date().toISOString();
        if (action.opType === 'UPDATE' && action.entityId) {
          executedData = await Career.findOneAndUpdate(
            { userId, 'dsaTopics.id': action.entityId },
            {
              $set: {
                'dsaTopics.$.lastRevised': todayStr,
                'dsaTopics.$.status': 'mastered'
              }
            },
            { new: true }
          );
        } else {
          // General Career doc update
          executedData = await Career.findOneAndUpdate(
            { userId },
            { $set: { updatedAt: todayStr } },
            { new: true, upsert: true }
          );
        }
        break;
      }

      case 'research': {
        if (action.opType === 'CREATE' && action.entityId) {
          const newPaper = {
            id: `paper_${Date.now()}`,
            title: action.targetData.paperTitle || action.title,
            authors: action.targetData.authors || 'Unknown',
            year: action.targetData.year || new Date().getFullYear(),
            status: 'unread',
            isImportant: true,
            createdAt: new Date().toISOString()
          };
          executedData = await Research.findOneAndUpdate(
            { userId, 'sections.id': action.targetData.sectionId || 'sec_1' },
            { $push: { 'sections.$.papers': newPaper } },
            { new: true }
          );
        }
        break;
      }

      case 'clients':
      case 'projects': {
        if (action.opType === 'CREATE') {
          const projectTitle = String(action.targetData.title || action.targetData.name || action.title || 'New Project').replace(/["']/g, '');
          executedData = await Project.create({
            _id: `project-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            userId,
            name: projectTitle,
            clientName: projectTitle,
            description: String(action.targetData.description || `Project/Client "${projectTitle}"`),
            status: 'active',
            progress: 0,
            color: '#6366f1'
          });
        } else if (action.opType === 'UPDATE') {
          const featureTitle = String(action.targetData.featureTitle || action.targetData.title || action.targetData.name || action.title || 'New Feature').replace(/["']/g, '');
          const newFeature = {
            id: `feat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            title: featureTitle,
            description: String(action.targetData.description || `Feature "${featureTitle}" requested via Co-Pilot`),
            completed: false,
            priority: action.targetData.priority || 'medium',
            createdAt: new Date().toISOString()
          };

          if (action.entityId) {
            executedData = await Project.findOneAndUpdate(
              { _id: action.entityId, userId },
              { $push: { features: newFeature } },
              { new: true }
            );
          } else {
            // Find target project by name or fallback to most recent active project
            const projectNameSearch = action.targetData.projectName ? String(action.targetData.projectName).replace(/["']/g, '').trim() : '';
            const query = projectNameSearch
              ? { userId, name: { $regex: projectNameSearch, $options: 'i' } }
              : { userId, status: 'active' };

            let project = await Project.findOne(query).sort({ updatedAt: -1 });
            if (project) {
              project.features.push(newFeature as any);
              await project.save();
              executedData = project;
            } else {
              // If no active project exists, create a default project and attach the feature
              executedData = await Project.create({
                _id: `project-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                userId,
                name: 'Main Project',
                clientName: 'Main Project',
                description: 'Default project created via Co-Pilot',
                status: 'active',
                features: [newFeature]
              });
            }
          }
        } else if (action.opType === 'DELETE') {
          if (action.entityId) {
            executedData = await Project.findOneAndDelete({ _id: action.entityId, userId });
          } else {
            const rawTarget = String(action.targetData?.title || action.targetData?.name || action.targetData?.prompt || '');
            const cleanTitle = rawTarget.replace(/["']/g, '').replace(/^(delete|remove)\s+(project|client)?\s*/i, '').trim();
            if (cleanTitle) {
              executedData = await Project.deleteMany({
                userId,
                name: { $regex: cleanTitle, $options: 'i' }
              });
            }
          }
        }
        break;
      }

      case 'habits': {
        if (action.opType === 'CREATE') {
          executedData = await Habit.create({
            userId,
            name: action.targetData.name || action.title,
            frequency: action.targetData.frequency || 'daily',
            timeSlot: action.targetData.timeSlot || 'morning',
            streak: 0
          });
        }
        break;
      }

      case 'goals': {
        if (action.opType === 'CREATE') {
          executedData = await Goal.create({
            userId,
            title: action.targetData.title || action.title,
            targetDate: action.targetData.targetDate || new Date().toISOString(),
            keyResults: action.targetData.keyResults || []
          });
        }
        break;
      }

      default:
        return NextResponse.json({ error: `Unsupported module: ${action.module}` }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      actionId: action.actionId,
      module: action.module,
      opType: action.opType,
      executedAt: new Date().toISOString(),
      executedData
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
