import { Events } from 'phaser';

// Used to emit events between React components and Phaser scenes
export const EventBus = new Events.EventEmitter();