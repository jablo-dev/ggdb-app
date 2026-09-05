import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule],
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `<router-outlet></router-outlet>`
})
export class AppComponent {
    constructor(private translate: TranslateService) {
        this.translate.addLangs(['en', 'de']);
        this.translate.setFallbackLang('en');

        const savedLang = localStorage.getItem('language');
        if (savedLang) {
            this.translate.use(savedLang);
        } else {
            this.translate.use('en');
        }
    }
}
