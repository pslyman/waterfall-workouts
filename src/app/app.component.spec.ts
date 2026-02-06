import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';

import { Platform } from '@ionic/angular';

import { AppComponent } from './app.component';
import { StorageService } from './services/storage.service';

describe('AppComponent', () => {

  let platformReadySpy: Promise<string>;
  let platformSpy: jasmine.SpyObj<Platform>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;

  beforeEach(waitForAsync(() => {
    platformReadySpy = Promise.resolve('ready');
    platformSpy = jasmine.createSpyObj('Platform', ['is', 'ready']);
    platformSpy.ready.and.returnValue(platformReadySpy);

    storageServiceSpy = jasmine.createSpyObj('StorageService', ['get', 'init', 'set']);
    storageServiceSpy.init.and.resolveTo();
    storageServiceSpy.get.and.resolveTo(null);

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: Platform, useValue: platformSpy },
        { provide: StorageService, useValue: storageServiceSpy },
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

});
