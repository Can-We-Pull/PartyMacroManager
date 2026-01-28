import { SavedVariables } from '../types';

export function logFactory(db: SavedVariables) {
  return function log(message: string, type: 'info' | 'warn' | 'error' = 'info'): void {
    const color = type === 'info' ? '00ff00' : type === 'warn' ? 'ffff00' : type === 'error' ? 'ff0000' : '00ff00';
    const prefix = `|cff${color}[PartyMacroManager]|r`;

    if (db.chatVerbosity === 'silent') {
      return;
    }
    if (db.chatVerbosity === 'normal' && type === 'info') {
      return;
    }

    switch (type) {
      case 'info':
        print(`${prefix} ${message}`);
        break;
      case 'warn':
        print(`${prefix} |cffffff00Warning: ${message}|r`);
        break;
      case 'error':
        print(`${prefix} |cffff0000Error: ${message}|r`);
        break;
    }
  };
}
