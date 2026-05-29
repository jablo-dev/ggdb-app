import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ToolbarService {
    private toolbarTemplate = new BehaviorSubject<TemplateRef<any> | null>(null);
    toolbarTemplate$ = this.toolbarTemplate.asObservable();

    private hasToolbar = new BehaviorSubject<boolean>(false);
    hasToolbar$ = this.hasToolbar.asObservable();

    setTemplate(template: TemplateRef<any> | null) {
        setTimeout(() => {
            this.toolbarTemplate.next(template);
            this.hasToolbar.next(!!template);
        });
    }
}
