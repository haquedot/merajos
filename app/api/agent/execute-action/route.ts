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
            userId,
            title: action.targetData.title || action.title,
            category: action.targetData.category || 'General',
            estimatedHours: action.targetData.estimatedHours || 1.0,
            priority: action.targetData.priority || 'medium',
            mit: action.targetData.mit || false,
            timeSlot: action.targetData.timeSlot || 'afternoon',
            status: 'pending'
          });
        } else if (action.opType === 'UPDATE' && action.entityId) {
          executedData = await Task.findOneAndUpdate(
            { _id: action.entityId, userId },
            { $set: action.targetData },
            { new: true }
          );
        } else if (action.opType === 'DELETE' && action.entityId) {
          executedData = await Task.findOneAndDelete({ _id: action.entityId, userId });
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

      case 'projects': {
        if (action.opType === 'CREATE') {
          executedData = await Project.create({
            userId,
            title: action.targetData.title || action.title,
            description: action.targetData.description || '',
            status: 'active',
            milestones: action.targetData.milestones || []
          });
        } else if (action.opType === 'DELETE' && action.entityId) {
          executedData = await Project.findOneAndDelete({ _id: action.entityId, userId });
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
