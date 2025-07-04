import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FadeInOnScrollDirective } from '../../fade-in-on-scroll.directive';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    RouterModule,
    FadeInOnScrollDirective
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  constructor(private router: Router) {}

  // 打字效果相關
  typingText = ""
  fullText = "讓記帳變智能"
  typingIndex = 0
  typingInterval: any

  // 主要功能特色列表
  features = [
    {
      icon: "smart_toy", // AI機器人圖標
      title: "AI智能分析",
      description: "運用人工智能技術，自動分析您的消費習慣，提供個人化的理財建議。",
      color: "var(--income)", // 綠色
    },
    {
      icon: "family_restroom", // 家庭圖標
      title: "共享記帳",
      description: "支援多人共同記帳，成員可以一起管理家庭財務，透明化支出。",
      color: "var(--expense)", // 橘色
    },
    {
      icon: "analytics", // 分析圖標
      title: "智能統計報表",
      description: "自動生成詳細的財務報表，包含圓餅圖、長條圖等多種視覺化圖表。",
      color: "var(--fixed-income)", // 紫色
    },
    {
      icon: "schedule", // 時間圖標
      title: "固定支出管理",
      description: "自動記錄房租、水電費等固定支出，提醒您即將到期的繳費項目。",
      color: "var(--fixed-expense)", // 黃色
    },
  ]

  // 輪播圖片列表 - 記帳本主題
  carouselImages = [
    {
      src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop&crop=center", // AI智能分析 - 數據儀表板
      alt: "AI智能分析儀表板",
      title: "智能分析",
    },
    {
      src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=400&fit=crop&crop=center", // 家庭共享 - 團隊協作
      alt: "家庭共享記帳",
      title: "家庭共享",
    },
    {
      src: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=400&fit=crop&crop=center", // 記事本記帳 - 筆記本和筆
      alt: "記事本記帳",
      title: "記帳本",
    },
  ]

  currentImageIndex = 0
  carouselInterval: any
  autoPlayPaused = false
  autoPlayTimeout: any

  getCarouselTransform() {
    return `translateX(-${this.currentImageIndex * 100}%)`;
  }

  ngOnInit() {
    // 啟動打字效果
    this.startTypingEffect()

    // 啟動輪播
    this.startCarousel()
  }

  ngOnDestroy() {
    // 清理定時器
    if (this.typingInterval) {
      clearInterval(this.typingInterval)
    }
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval)
    }
    if (this.autoPlayTimeout) {
      clearTimeout(this.autoPlayTimeout)
    }
  }

  // 打字效果
  startTypingEffect() {
    this.typingInterval = setInterval(() => {
      if (this.typingIndex < this.fullText.length) {
        this.typingText += this.fullText[this.typingIndex]
        this.typingIndex++
      } else {
        // 打字完成，清除當前interval
        clearInterval(this.typingInterval)
        // 等待8秒後重新開始
        setTimeout(() => {
          this.typingText = ""
          this.typingIndex = 0
          this.startTypingEffect() // 重新啟動
        }, 8000)
      }
    }, 300)
  }

  // 輪播功能
  startCarousel() {
    this.carouselInterval = setInterval(() => {
      if (!this.autoPlayPaused) {
        this.nextImage()
      }
    }, 4000) // 每4秒切換
  }

  pauseAutoPlay() {
    this.autoPlayPaused = true
    if (this.autoPlayTimeout) {
      clearTimeout(this.autoPlayTimeout)
    }
    this.autoPlayTimeout = setTimeout(() => {
      this.autoPlayPaused = false
    }, 5000)
  }

  nextImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.carouselImages.length
    this.pauseAutoPlay()
  }

  prevImage() {
    this.currentImageIndex = this.currentImageIndex === 0 ? this.carouselImages.length - 1 : this.currentImageIndex - 1
    this.pauseAutoPlay()
  }

  goToImage(index: number) {
    this.currentImageIndex = index
    this.pauseAutoPlay()
  }
}
