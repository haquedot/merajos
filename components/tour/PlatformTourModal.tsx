'use client';

import React, { useEffect } from 'react';
import { driver } from 'driver.js';

interface PlatformTourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlatformTourModal: React.FC<PlatformTourModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;

    // Small delay to ensure all DOM elements are mounted and styled
    const timer = setTimeout(() => {
      const driverObj = driver({
        showProgress: true,
        animate: true,
        overlayColor: 'rgba(11, 17, 32, 0.75)',
        nextBtnText: 'Next →',
        prevBtnText: '← Back',
        doneBtnText: 'Start Using Orbit 🚀',
        onDestroyed: () => {
          onClose();
        },
        steps: [
          {
            element: '#tour-sidebar-logo',
            popover: {
              title: 'Welcome to Orbit 👋',
              description:
                'Orbit is your personal productivity workspace. It brings your tasks, calendar, habits, projects, and goals together into a clean, simple layout.',
              side: 'right',
              align: 'start',
            },
          },
          {
            element: '#tour-sidebar-navigation',
            popover: {
              title: 'Navigation & Modules 🧭',
              description:
                'Use the sidebar to navigate between your Dashboard, Today view, Tasks, Calendar, and specialized Modules like Clients, Research, Habits, and Goals.',
              side: 'right',
              align: 'start',
            },
          },
          {
            element: '#tour-search',
            popover: {
              title: 'Instant Search (Ctrl + K) 🔍',
              description:
                'Looking for a specific task, project, note, or event? Press Ctrl + K (or Cmd + K) anytime to search your entire workspace instantly.',
              side: 'bottom',
              align: 'start',
            },
          },
          {
            element: '#tour-quick-add',
            popover: {
              title: 'Quick Add Anything ⚡',
              description:
                'Click this button to quickly add a new Task, Event, Habit, Project, or Note from anywhere in the platform without leaving your page.',
              side: 'bottom',
              align: 'center',
            },
          },
          {
            element: '#tour-google-sync',
            popover: {
              title: 'Cloud & Local Mode ☁️',
              description:
                'Orbit works 100% offline out-of-the-box. Sign in with Google anytime to automatically sync your Tasks and Calendar across your devices.',
              side: 'bottom',
              align: 'center',
            },
          },
          {
            element: '#tour-focus-panel',
            popover: {
              title: 'Focus Panel & Pomodoro ⏱️',
              description:
                'Toggle the focus drawer to use the built-in Pomodoro study timer, ambient focus sounds, and quick scratchpad notes while you work.',
              side: 'bottom',
              align: 'end',
            },
          },
          {
            element: '#tour-help-icon',
            popover: {
              title: 'Replay Tour Anytime ❓',
              description:
                'You can click this Help icon in the top header anytime to restart this platform tour.',
              side: 'bottom',
              align: 'end',
            },
          },
        ],
      });

      driverObj.drive();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  return null;
};
