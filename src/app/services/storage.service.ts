import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private readonly storage: Storage) {
    this.init();
  }

  async init(): Promise<void> {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  public set(key: string, value: unknown): void {
    this._storage?.set(key, value);
  }

  public async get<T = unknown>(key: string): Promise<T | null> {
    const value = await this._storage?.get(key);
    return (value ?? null) as T | null;
  }
}
