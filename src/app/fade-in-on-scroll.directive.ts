import { Directive, ElementRef, Renderer2, AfterViewInit, Input } from '@angular/core';

@Directive({
  selector: '[appFadeInOnScroll]'
})
export class FadeInOnScrollDirective implements AfterViewInit {
  @Input() animationType: 'fade-in-up' | 'fade-in-left' | 'fade-in-right' | 'fade-in-down' | 'scale-in' | 'slide-in' = 'fade-in-up';
  @Input() delay: number = 0;
  @Input() threshold: number = 0.2;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngAfterViewInit() {
    // 設定初始狀態
    this.renderer.addClass(this.el.nativeElement, 'animate-on-scroll');
    this.renderer.addClass(this.el.nativeElement, this.animationType);

    // 設定延遲
    if (this.delay > 0) {
      this.renderer.setStyle(this.el.nativeElement, 'transition-delay', `${this.delay}s`);
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // 添加觸發類別
          this.renderer.addClass(this.el.nativeElement, 'animate-triggered');
          observer.unobserve(this.el.nativeElement);
        }
      });
    }, { threshold: this.threshold });

    observer.observe(this.el.nativeElement);
  }
}
