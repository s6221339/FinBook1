import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

   constructor(private router: Router) {}
  // 主要功能特色列表
  features = [
    {
      icon: "smart_toy", // AI機器人圖標
      title: "AI智能分析",
      description: "運用人工智能技術，自動分析您的消費習慣，提供個人化的理財建議。",
      color: "#3b82f6", // 藍色
    },
    {
      icon: "family_restroom", // 家庭圖標
      title: "家庭共享記帳",
      description: "支援多人共同記帳，家庭成員可以一起管理家庭財務，透明化支出。",
      color: "#ec4899", // 粉色
    },
    {
      icon: "analytics", // 分析圖標
      title: "智能統計報表",
      description: "自動生成詳細的財務報表，包含圓餅圖、長條圖等多種視覺化圖表。",
      color: "#10b981", // 綠色
    },
    {
      icon: "schedule", // 時間圖標
      title: "固定支出管理",
      description: "自動記錄房租、水電費等固定支出，提醒您即將到期的繳費項目。",
      color: "#f59e0b", // 橘色
    },
  ]

  // 統計數據（模擬數據）
  stats = [
    {
      number: 10000, // 目標數字
      currentNumber: 0, // 當前顯示數字（用於動畫）
      label: "活躍用戶",
      suffix: "+",
    },
    {
      number: 50000,
      currentNumber: 0,
      label: "記帳筆數",
      suffix: "+",
    },
    {
      number: 98,
      currentNumber: 0,
      label: "用戶滿意度",
      suffix: "%",
    },
    {
      number: 24,
      currentNumber: 0,
      label: "全天候服務",
      suffix: "/7",
    },
  ]

  // 用戶評價列表
  testimonials = [
    {
      name: "郭旻諺",
      role: "上班族",
      avatar: "/placeholder.svg?height=60&width=60",
      content: "使用智能記帳本後，我終於知道錢都花到哪裡去了！AI分析功能真的很實用。",
      rating: 5,
    },
    {
      name: "郭旻諺",
      role: "家庭主婦",
      avatar: "/placeholder.svg?height=60&width=60",
      content: "家庭共享功能太棒了！現在全家人都能一起管理家庭支出，很透明。",
      rating: 5,
    },
    {
      name: "郭旻諺",
      role: "學生",
      avatar: "/placeholder.svg?height=60&width=60",
      content: "介面簡潔好用，統計報表很清楚，幫助我更好地控制生活費。",
      rating: 5,
    },
  ]

  ngOnInit() {
    // 頁面載入時啟動數字計數動畫
    this.startCountAnimation()
  }

  // 數字計數動畫
  startCountAnimation() {
    this.stats.forEach((stat, index) => {
      // 延遲啟動，讓動畫依序執行
      setTimeout(() => {
        this.animateNumber(stat)
      }, index * 200) // 每個數字延遲200ms
    })
  }

  // 單個數字的動畫效果
  animateNumber(stat: any) {
    const duration = 2000 // 動畫持續2秒
    const steps = 60 // 動畫步數
    const increment = stat.number / steps // 每步增加的數值
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      stat.currentNumber = Math.floor(increment * currentStep)

      // 動畫完成
      if (currentStep >= steps) {
        stat.currentNumber = stat.number
        clearInterval(timer)
      }
    }, duration / steps)
  }

  // 生成星星評分
  getStars(rating: number): string[] {
    return Array(5)
      .fill("")
      .map((_, index) => (index < rating ? "star" : "star_border"))
  }
}


