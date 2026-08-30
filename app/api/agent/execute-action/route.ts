import { NextResponse } from 'next/server';
import { verifyAuth } from '../../../../lib/middleware/auth';
import { connectToDatabase } from '../../../../lib/mongodb';
import { AgentActionProposal } from '../../../../lib/agent/types';
import { dispatchAgentAction } from '../../../../lib/agent/handlers';

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

    const executedData = await dispatchAgentAction(action, userId);

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
