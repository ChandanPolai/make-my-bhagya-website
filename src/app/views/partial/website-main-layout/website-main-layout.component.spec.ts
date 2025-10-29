import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebsiteMainLayoutComponent } from './website-main-layout.component';

describe('WebsiteMainLayoutComponent', () => {
  let component: WebsiteMainLayoutComponent;
  let fixture: ComponentFixture<WebsiteMainLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebsiteMainLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebsiteMainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
