import Settings from '../../../models/Settings';
import { AgentActionProposal } from '../types';
import { ActionHandler } from './baseHandler';

export class SettingsActionHandler implements ActionHandler {
  module = 'settings';

  async execute(action: AgentActionProposal, userId: string): Promise<unknown> {
    let settings = await Settings.findOne({ _id: userId }) || await Settings.findOne({ _id: 'default' });

    if (!settings) {
      settings = await Settings.create({
        _id: userId,
        theme: 'dark',
        accentColor: '#6D5BFF',
        sidebarCollapsed: false,
        pomodoroTime: 25,
        soundEnabled: true,
        emailNotificationsEnabled: false,
        notificationEmail: ''
      });
    }

    if (action.opType === 'UPDATE' || action.opType === 'CREATE') {
      const themeVal = (action.targetData as any)?.theme || (action.targetData as any)?.themeMode;
      if (themeVal && ['light', 'dark', 'system'].includes(themeVal)) {
        settings.theme = themeVal;
      }

      if ((action.targetData as any)?.accentColor) {
        settings.accentColor = (action.targetData as any).accentColor;
      }

      if ((action.targetData as any)?.pomodoroTime !== undefined) {
        settings.pomodoroTime = Number((action.targetData as any).pomodoroTime);
      }

      if ((action.targetData as any)?.soundEnabled !== undefined) {
        settings.soundEnabled = Boolean((action.targetData as any).soundEnabled);
      }

      await settings.save();
      return settings;
    }

    if (action.opType === 'READ') {
      return settings;
    }

    throw new Error(`Unsupported opType '${action.opType}' for module 'settings'`);
  }
}
