import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private storageInstance: Storage | null = null;
  private initPromise: Promise<void> | null = null;

  constructor(private readonly storage: Storage) {
  }

  async init(): Promise<void> {
    if (this.storageInstance) {
      return;
    }

    if (!this.initPromise) {
      this.initPromise = (async () => {
        this.storageInstance = await this.storage.create();
      })();
    }

    await this.initPromise;
  }

  private async getStorage(): Promise<Storage> {
    await this.init();
    if (!this.storageInstance) {
      throw new Error('Storage failed to initialize');
    }

    return this.storageInstance;
  }

  public async set(key: string, value: unknown): Promise<void> {
    const store = await this.getStorage();
    await store.set(key, value);
  }

  public async get<T = unknown>(key: string): Promise<T | null> {
    const store = await this.getStorage();
    const value = await store.get(key);
    return (value ?? null) as T | null;
  }

  public async remove(key: string): Promise<void> {
    const store = await this.getStorage();
    await store.remove(key);
  }
}
