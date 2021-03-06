import { HeroesComponent } from './heroes.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, Component, Input, Directive } from '@angular/core';
import { HeroService } from '../hero.service';
import { of } from 'rxjs';
import { Hero } from '../hero';
import { By } from '@angular/platform-browser';
import { HeroComponent } from '../hero/hero.component';

@Directive({
    selector: '[routerLink]',
    host: { '(click)' : 'onClick()' }
})

export class RouterLinkDirectiveStub {
    @Input('routerLink') linkParams: any;
    navigatedTo: any = null;

    onClick() {
        this.navigatedTo = this.linkParams;
    }

}

describe('HeroesComponent (deep test)', () => {
    let fixture: ComponentFixture<HeroesComponent>;
    let mockHeroService;
    let HEROES;


    beforeEach(() => {
        mockHeroService = jasmine.createSpyObj(['getHeroes', 'addHero', 'deleteHero']);

        HEROES = [
            {id: 1, name: 'SpiderWoman', strength: 8},
            {id: 2, name: 'AquaMan', strength: 13},
            {id: 4, name: 'SuperWoman', strength: 18}
        ];

        TestBed.configureTestingModule({
            declarations: [
                HeroesComponent,
                HeroComponent,
                RouterLinkDirectiveStub
            ],
            providers: [
                {
                    provide: HeroService,
                    useValue: mockHeroService
                }
            ],
            // schemas: [NO_ERRORS_SCHEMA] 
            /** 
             * Can't bind to 'routerLink' since it isn't a known property of 'a'. ("<a [ERROR ->]routerLink="/detail/{{hero.id}}">
                <span class="badge">{{hero.id}}</span> {{hero.name}}
                
             */
        });

        fixture = TestBed.createComponent(HeroesComponent);
    });

    it('should render each hero as a heroComponent', () => {
        mockHeroService.getHeroes.and.returnValue(of(HEROES));

        // run ngOnInit
        fixture.detectChanges();

        const heroComponentDEs = fixture.debugElement.queryAll(By.directive(HeroComponent));
        expect(heroComponentDEs.length).toEqual(3);

        // expect(heroComponentDEs[0].componentInstance.hero.name).toEqual('SpiderWoman');
        // expect(heroComponentDEs[1].componentInstance.hero.name).toEqual('AquaMan');
        // expect(heroComponentDEs[2].componentInstance.hero.name).toEqual('SuperWoman');

        for (let i = 0; i < heroComponentDEs.length; i++) {
            expect(heroComponentDEs[i].componentInstance.hero).toEqual(HEROES[i]);
        }
    });

    it(`this should call heroService.deleteHero,
        when Hero component's delte button is clicked - events on elements`, () => {
            spyOn(fixture.componentInstance, 'deleteFromParent');
            mockHeroService.getHeroes.and.returnValue(of(HEROES));

            fixture.detectChanges();

            const heroComponentDEs = fixture.debugElement.queryAll(By.directive(HeroComponent));
            heroComponentDEs[2].query(By.css('button'))
                .triggerEventHandler('click', { stopPropagation: () => {} });

            expect(fixture.componentInstance.deleteFromParent).toHaveBeenCalledWith(HEROES[2]);
    });

    it(`this should call heroService.deleteHero,
        when Hero component's delte button is clicked - emmiting event`, () => {
            spyOn(fixture.componentInstance, 'deleteFromParent');
            /* Error: <toHaveBeenCalledWith> : Expected a spy, but got Function.
                Usage: expect(<spyObj>).toHaveBeenCalledWith(...arguments) */
            mockHeroService.getHeroes.and.returnValue(of(HEROES));

            fixture.detectChanges();

            const heroComponentDEs = fixture.debugElement.queryAll(By.directive(HeroComponent));
            (<HeroComponent>heroComponentDEs[0].componentInstance).deleteFromChild.emit(undefined);
            // HEROES[0] or undefined will also work here

            expect(fixture.componentInstance.deleteFromParent).toHaveBeenCalledWith(HEROES[0]);
    });

    it(`this should call heroService.deleteHero,
        when Hero component's delte button is clicked - on child directive`, () => {
            spyOn(fixture.componentInstance, 'deleteFromParent');
            /* Error: <toHaveBeenCalledWith> : Expected a spy, but got Function.
                Usage: expect(<spyObj>).toHaveBeenCalledWith(...arguments) */
            mockHeroService.getHeroes.and.returnValue(of(HEROES));

            fixture.detectChanges();

            const heroComponentDEs = fixture.debugElement.queryAll(By.directive(HeroComponent));
            heroComponentDEs[0].triggerEventHandler('deleteFromChild', null);

            expect(fixture.componentInstance.deleteFromParent).toHaveBeenCalledWith(HEROES[0]);
    });

    it('should add new hero to list when add button is clicked', () => {
        mockHeroService.getHeroes.and.returnValue(of(HEROES));
        fixture.detectChanges();
        const name = 'Yomera';
        mockHeroService.addHero.and.returnValue(of({ id: 5, name: name, strength: 44 }));
        const inputElelement =  fixture.debugElement.query(By.css('input')).nativeElement; // dom element
        const addBtn =          fixture.debugElement.queryAll(By.css('button'))[0];

        inputElelement.value = name;
        addBtn.triggerEventHandler('click', null);
        fixture.detectChanges();

        const heroText = fixture.debugElement.query(By.css('ul')).nativeElement.textContent;
        expect(heroText).toContain(name);
    });

    it('should have the correct route for the first hero', ( ) => {
        mockHeroService.getHeroes.and.returnValue(of(HEROES));
        fixture.detectChanges();
        const heroComponentDEs = fixture.debugElement.queryAll(By.directive(HeroComponent));

        const routerLink = heroComponentDEs[0]
            .query(By.directive(RouterLinkDirectiveStub))
            .injector.get(RouterLinkDirectiveStub);

        heroComponentDEs[0].query(By.css('a')).triggerEventHandler('click', null);

        expect(routerLink.navigatedTo).toBe('/detail/1');
    });
});
