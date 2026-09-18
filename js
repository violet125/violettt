<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JavaScript UI 动效 · 粒子背景与动态按钮</title>
  <style>
    /* 基础重置与字体 */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #0f0f1a;
      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow: hidden;
      position: relative;
    }

    /* 画布充满全屏，位于底层 */
    #particle-canvas {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      pointer-events: none; /* 让鼠标事件穿透到按钮 */
    }

    /* 卡片式内容容器，轻盈的玻璃态 */
    .content {
      position: relative;
      z-index: 10;
      text-align: center;
      padding: 3rem 2.5rem;
      border-radius: 2.5rem;
      background: rgba(20, 20, 35, 0.55);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 30px 50px -20px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.02) inset;
      transition: transform 0.3s ease, box-shadow 0.5s ease;
      animation: float 6s ease-in-out infinite;
    }

    /* 卡片本身也有微弱的浮动 */
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }

    /* 标题文字 */
    h1 {
      font-size: 2.8rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      margin-bottom: 1.25rem;
      background: linear-gradient(135deg, #ffffff 0%, #b0b0ff 80%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      text-shadow: 0 0 30px rgba(120, 120, 255, 0.4);
      animation: glowPulse 3s infinite alternate;
    }

    @keyframes glowPulse {
      0% { text-shadow: 0 0 20px rgba(120, 120, 255, 0.3); }
      100% { text-shadow: 0 0 40px rgba(140, 140, 255, 0.8); }
    }

    /* 描述文字 */
    p {
      font-size: 1.1rem;
      color: #b8b8d0;
      margin-bottom: 2.5rem;
      max-width: 400px;
      line-height: 1.6;
      font-weight: 300;
      letter-spacing: 0.3px;
    }

    /* --- 动效按钮核心样式 --- */
    .btn {
      --btn-color: #6d6dff;
      --btn-glow: #6d6dff88;
      position: relative;
      display: inline-block;
      padding: 1rem 2.8rem;
      font-size: 1.2rem;
      font-weight: 500;
      letter-spacing: 0.5px;
      color: #ffffff;
      background: transparent;
      border: none;
      border-radius: 3rem;
      cursor: pointer;
      outline: none;
      z-index: 1;
      transition: transform 0.25s cubic-bezier(0.2, 0.9, 0.4, 1.1), box-shadow 0.3s ease;
      box-shadow: 0 0 0 0 var(--btn-glow), 0 8px 25px -8px rgba(0, 0, 0, 0.8);
      background: linear-gradient(145deg, #5a5aff, #3f3fcf);
      /* 让按钮本身也有微妙的光泽 */
    }

    /* 按钮的发光边框层（伪元素） */
    .btn::before {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 3rem;
      background: linear-gradient(135deg, #a0a0ff, #4d4dff, #b0b0ff);
      z-index: -2;
      opacity: 0.7;
      filter: blur(6px);
      transition: opacity 0.4s ease, filter 0.4s ease;
    }

    /* 内层用来遮挡出清晰的边缘 */
    .btn::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 3rem;
      background: linear-gradient(145deg, #5a5aff, #3f3fcf);
      z-index: -1;
      transition: background 0.3s ease;
    }

    /* 悬停时的动效：放大、发光、边框更亮 */
    .btn:hover {
      transform: scale(1.06) translateY(-2px);
      box-shadow: 0 0 30px 2px var(--btn-glow), 0 15px 30px -10px #000000;
    }

    .btn:hover::before {
      opacity: 1;
      filter: blur(12px);
    }

    /* 点击时的反馈 */
    .btn:active {
      transform: scale(0.98) translateY(1px);
      box-shadow: 0 0 20px 0 var(--btn-glow);
      transition: transform 0.05s ease;
    }

    /* 按钮文字轻微的浮动效果 (可选) */
    .btn span {
      display: inline-block;
      transition: transform 0.3s ease;
    }

    .btn:hover span {
      transform: translateX(4px);
    }

    /* 响应式调整 */
    @media (max-width: 500px) {
      .content {
        padding: 2rem 1.5rem;
        margin: 0 1rem;
      }
      h1 {
        font-size: 2rem;
      }
      .btn {
        padding: 0.9rem 2rem;
        font-size: 1rem;
      }
    }

    /* 鼠标跟随的圆点（可选，增加精致感）—— 通过JS动态添加 */
    .cursor-dot {
      position: fixed;
      width: 6px;
      height: 6px;
      background: #8a8aff;
      border-radius: 50%;
      pointer-events: none;
      z-index: 999;
      box-shadow: 0 0 15px #6d6dff;
      transition: opacity 0.3s;
      opacity: 0.7;
      transform: translate(-50%, -50%);
    }

    /* 小屏隐藏可能干扰的元素 */
    @media (max-width: 600px) {
      .cursor-dot {
        display: none;
      }
    }
  </style>
</head>
<body>
  <!-- 粒子背景画布 -->
  <canvas id="particle-canvas"></canvas>

  <!-- 主内容区 -->
  <div class="content">
    <h1>动效实验室</h1>
    <p>粒子流动 · 悬停反馈 · 点击涟漪<br>感受 JavaScript 驱动的视觉韵律</p>
    <!-- 动效按钮：有悬停、点击、光晕变化，点击后也会有粒子爆发效果（通过JS） -->
    <button class="btn" id="actionBtn">
      <span>探索动效</span>
    </button>
  </div>

  <!-- 自定义光标圆点（跟随鼠标） -->
  <div class="cursor-dot" id="cursorDot"></div>

  <script>
    (function() {
      // ---------- 1. 粒子背景系统 ----------
      const canvas = document.getElementById('particle-canvas');
      const ctx = canvas.getContext('2d');
      
      let width, height;
      let particles = [];
      const PARTICLE_COUNT = 120;  // 粒子数量适中，保证性能

      // 鼠标位置（用于粒子交互）
      let mouse = { x: null, y: null, radius: 150 };

      // 初始化/重置画布尺寸
      function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        // 重新初始化粒子位置，避免分布不均 (重置)
        if (particles.length > 0) {
          // 保持现有粒子但确保在边界内（简单处理：重新生成或调整位置）
          particles.forEach(p => {
            p.x = Math.min(p.x, width);
            p.y = Math.min(p.y, height);
          });
        }
      }

      // 粒子类
      class Particle {
        constructor() {
          this.x = Math.random() * width;
          this.y = Math.random() * height;
          // 移动方向与速度
          this.vx = (Math.random() - 0.5) * 0.4;
          this.vy = (Math.random() - 0.5) * 0.4;
          // 半径
          this.radius = Math.random() * 2.5 + 1.2;  // 1.2 ~ 3.7
          // 颜色微调 (蓝紫色系)
          this.hue = Math.random() * 40 + 220; // 220~260 蓝紫
          this.saturation = 70 + Math.random() * 20; // 70~90
          this.lightness = 60 + Math.random() * 20; // 60~80
          this.alpha = Math.random() * 0.6 + 0.2; // 0.2~0.8
        }

        // 更新位置
        update() {
          // 自然移动
          this.x += this.vx;
          this.y += this.vy;

          // 边界处理：环绕效果 (更柔和)
          if (this.x < 0) this.x = width;
          if (this.x > width) this.x = 0;
          if (this.y < 0) this.y = height;
          if (this.y > height) this.y = 0;

          // 鼠标交互：粒子轻微排斥
          if (mouse.x !== null && mouse.y !== null) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius) {
              const force = (mouse.radius - distance) / mouse.radius;
              const angle = Math.atan2(dy, dx);
              const moveX = Math.cos(angle) * force * 1.6;
              const moveY = Math.sin(angle) * force * 1.6;
              this.x += moveX;
              this.y += moveY;
            }
          }
        }

        // 绘制粒子
        draw() {
          ctx.beginPath();
          // 使用hsla颜色
          ctx.fillStyle = `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.alpha})`;
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fill();

          // 添加微弱的光晕（可选）
          ctx.shadowColor = `hsla(${this.hue}, 90%, 70%, 0.4)`;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0; // 重置避免影响其他绘制
        }
      }

      // 初始化粒子数组
      function initParticles() {
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          particles.push(new Particle());
        }
      }

      // 绘制连线 (粒子之间的网络效果)
      function drawLines() {
        ctx.strokeStyle = 'rgba(140, 140, 255, 0.12)';
        ctx.lineWidth = 0.8;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 110) {
              // 透明度随距离变化
              const opacity = (1 - distance / 110) * 0.35;
              ctx.strokeStyle = `rgba(140, 160, 255, ${opacity})`;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      // 动画循环
      function animate() {
        // 清除画布：使用半透明填充产生拖尾效果，更有质感
        ctx.fillStyle = 'rgba(10, 10, 20, 0.2)';
        ctx.fillRect(0, 0, width, height);

        // 更新和绘制所有粒子
        particles.forEach(particle => {
          particle.update();
          particle.draw();
        });

        // 绘制粒子之间的连线
        drawLines();

        requestAnimationFrame(animate);
      }

      // 设置鼠标监听
      function setupMouseEvents() {
        window.addEventListener('mousemove', (e) => {
          mouse.x = e.clientX;
          mouse.y = e.clientY;
        });
        window.addEventListener('mouseleave', () => {
          mouse.x = null;
          mouse.y = null;
        });
        // 触摸设备支持
        window.addEventListener('touchmove', (e) => {
          if (e.touches.length > 0) {
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
          }
        }, { passive: true });
        window.addEventListener('touchend', () => {
          mouse.x = null;
          mouse.y = null;
        });
      }

      // 启动粒子系统
      function initParticleSystem() {
        resizeCanvas();
        initParticles();
        setupMouseEvents();
        animate();
        window.addEventListener('resize', () => {
          resizeCanvas();
          // 简单重新生成粒子（避免粒子跑出太远）
          initParticles();
        });
      }

      // ---------- 2. 按钮动效增强：点击粒子爆发 ----------
      function initButtonEffect() {
        const btn = document.getElementById('actionBtn');
        
        btn.addEventListener('click', (e) => {
          // 按钮点击涟漪效果已经通过CSS实现，这里额外添加粒子爆发
          // 创建一些临时粒子从按钮位置飞散
          const rect = btn.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          // 生成30个临时粒子
          for (let i = 0; i < 30; i++) {
            createBurstParticle(centerX, centerY);
          }
        });

        // 临时粒子生成函数（直接操作画布，不影响主粒子数组）
        function createBurstParticle(startX, startY) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 5 + 2;
          const vx = Math.cos(angle) * speed;
          const vy = Math.sin(angle) * speed;
          const radius = Math.random() * 4 + 1.5;
          const hue = Math.random() * 40 + 220; // 蓝紫色
          const alpha = 1;
          let life = 1.0;
          const decay = 0.02 + Math.random() * 0.03; // 寿命消耗

          let x = startX;
          let y = startY;

          // 使用requestAnimationFrame单独驱动这个爆发粒子
          function updateBurst() {
            if (life <= 0) return;

            life -= decay;
            x += vx;
            y += vy;
            // 稍微有点减速效果
            // 实际上为了让粒子飞得更自然，可以让速度稍微衰减，但非必须

            // 绘制
            ctx.beginPath();
            ctx.arc(x, y, radius * life, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${hue}, 90%, 70%, ${life * 0.9})`;
            ctx.shadowColor = `hsla(${hue}, 90%, 70%, 0.8)`;
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0; // 重置

            requestAnimationFrame(updateBurst);
          }

          requestAnimationFrame(updateBurst);
        }
      }

      // ---------- 3. 鼠标跟随圆点 (自定义光标效果) ----------
      function initCursorDot() {
        const dot = document.getElementById('cursorDot');
        if (!dot) return;

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let dotX = mouseX;
        let dotY = mouseY;
        let isVisible = false;

        window.addEventListener('mousemove', (e) => {
          mouseX = e.clientX;
          mouseY = e.clientY;
          if (!isVisible) {
            dot.style.opacity = '0.7';
            isVisible = true;
          }
        });

        window.addEventListener('mouseleave', () => {
          dot.style.opacity = '0';
          isVisible = false;
        });

        // 平滑跟随
        function animateDot() {
          // 缓动跟随
          dotX += (mouseX - dotX) * 0.15;
          dotY += (mouseY - dotY) * 0.15;
          dot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`;
          requestAnimationFrame(animateDot);
        }

        animateDot();

        // 触摸设备上隐藏
        if ('ontouchstart' in window) {
          dot.style.display = 'none';
        }
      }

      // ---------- 启动所有动效 ----------
      window.addEventListener('load', () => {
        initParticleSystem();
        initButtonEffect();
        initCursorDot();
      });

    })();
  </script>
</body>
</html>
