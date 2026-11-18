import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { RegisterUser } from './register-user';

describe('RegisterUser', () => {
  let component: RegisterUser;
  let fixture: ComponentFixture<RegisterUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterUser],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterUser);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
