class Vec2 {
  constructor(x, y) {
      this.x = x;
      this.y = y;
  }

  lerp(target, amount) {
      this.x += (target.x - this.x) * amount;
      this.y += (target.y - this.y) * amount;
      return this;
  }

  sub(vec) {
      this.x -= vec.x;
      this.y -= vec.y;
      return this;
  }

  clone() {
      return new Vec2(this.x, this.y);
  }

  copy(vec) {
      this.x = vec.x;
      this.y = vec.y;
      return this;
  }
}

class Cursor {
  constructor(targetEl) {
      this.el = targetEl;

      this.position = {
          previous: new Vec2(-100, -100),
          current: new Vec2(-100, -100),
          target: new Vec2(-100, -100),
          lerpAmount: 0.1
      };
      this.scale = {
          previous: 1,
          current: 1,
          target: 1,
          lerpAmount: 0.1
      };

      this.isHovered = false;
      this.hoverEl = null;

      this.addListeners();
  }

  update() {
      this.position.current.lerp(this.position.target, this.position.lerpAmount);
      this.scale.current = gsap.utils.interpolate(
          this.scale.current,
          this.scale.target,
          this.scale.lerpAmount
      );

      const delta = this.position.current.clone().sub(this.position.previous);

      this.position.previous.copy(this.position.current);
      this.scale.previous = this.scale.current;

      gsap.set(this.el, {
          x: this.position.current.x,
          y: this.position.current.y
      });

      if (!this.isHovered) {
          const angle = Math.atan2(delta.y, delta.x) * (180 / Math.PI);
          const distance = Math.sqrt(delta.x * delta.x + delta.y * delta.y) * 0.04;

          gsap.set(this.el, {
              rotate: angle,
              scaleX: this.scale.current + Math.min(distance, 1),
              scaleY: this.scale.current - Math.min(distance, 0.3)
          });
      }
  }

  updateTargetPosition(x, y) {
      if (this.isHovered) {
          const bounds = this.hoverEl.getBoundingClientRect();

          const cx = bounds.x + bounds.width / 2;
          const cy = bounds.y + bounds.height / 2;

          const dx = x - cx;
          const dy = y - cy;

          this.position.target.x = cx + dx * 0.15;
          this.position.target.y = cy + dy * 0.15;
          this.scale.target = 2;

          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          const distance = Math.sqrt(dx * dx + dy * dy) * 0.01;

          gsap.set(this.el, { rotate: angle });
          gsap.to(this.el, {
              scaleX: this.scale.target + Math.pow(Math.min(distance, 0.6), 3) * 3,
              scaleY: this.scale.target - Math.pow(Math.min(distance, 0.3), 3) * 3,
              duration: 0.5,
              ease: "power4.out",
              overwrite: true
          });
      } else {
          this.position.target.x = x;
          this.position.target.y = y;
          this.scale.target = 1;
      }
  }

  addListeners() {
      document.querySelectorAll("[data-hover]").forEach((hoverEl) => {
          const hoverBoundsEl = hoverEl.querySelector("[data-hover-bounds]");
          hoverBoundsEl.addEventListener("pointerover", () => {
              this.isHovered = true;
              this.hoverEl = hoverBoundsEl;
          });
          hoverBoundsEl.addEventListener("pointerout", () => {
              this.isHovered = false;
              this.hoverEl = null;
          });

          hoverEl.addEventListener("pointermove", (event) => {
              const { clientX: cx, clientY: cy } = event;
              const { height, width, left, top } = hoverEl.getBoundingClientRect();
              const x = cx - (left + width / 2);
              const y = cy - (top + height / 2);
              hoverEl.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
          });

          hoverEl.addEventListener("pointerout", () => {
              gsap.to(hoverEl, {
                  x: 0,
                  y: 0,
                  duration: 1,
                  ease: "elastic.out(1, 0.3)",
                  clearProps: "transform"
              });
          });
      });
  }
}

const cursor = new Cursor(document.querySelector(".cursor"));

const cta = document.querySelector(".cta");
const menuBtn = document.querySelector(".menu-btn");

function onResize() {
  const { x, y, width, height } = menuBtn.getBoundingClientRect();

  gsap.set(cta, {
      left: x - width,
      top: y + height
  });
}

function update() {
  cursor.update();
  requestAnimationFrame(update);
}

function onMouseMove(event) {
  const x = event.clientX;
  const y = event.clientY;

  cursor.updateTargetPosition(x, y);
}

window.addEventListener("pointermove", onMouseMove);
window.addEventListener("resize", onResize);

onResize();
update();
