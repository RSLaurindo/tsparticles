import { pJSParticle } from './pjsparticle';
import { pJSUtils } from './pjsutils';
import { pJSContainer } from './pjscontainer';
import { pJSOutMode, pJSHoverMode, pJSClickMode } from './pjsenums';
import { pJSMouseData } from './pjsinterfaces';

'use strict';

export class pJSParticles {
    pJSContainer: pJSContainer;
    array: pJSParticle[];
    pushing?: boolean;

    constructor(pJSContainer: pJSContainer) {
        this.pJSContainer = pJSContainer;
        this.array = [];
    }

    /* --------- pJS functions - particles ----------- */
    create() {
        let pJS = this.pJSContainer;
        let options = pJS.options;

        for (let i = 0; i < options.particles.number.value; i++) {
            const p = new pJSParticle(pJS, options.particles.color, options.particles.opacity.value);

            this.array.push(p);
        }
    }

    update() {
        let pJS = this.pJSContainer;
        let options = pJS.options;
        const arrLength = this.array.length;

        for (let i = 0; i < arrLength; i++) {
            /* the particle */
            let p = this.array[i];
            // let d = ( dx = pJS.interactivity.mouse.click_pos_x - p.x ) * dx + ( dy = pJS.interactivity.mouse.click_pos_y - p.y ) * dy;
            // let f = -BANG_SIZE / d;
            // if ( d < BANG_SIZE ) {
            //     let t = Math.atan2( dy, dx );
            //     p.vx = f * Math.cos(t);
            //     p.vy = f * Math.sin(t);
            // }

            /* move the particle */
            if (options.particles.move.enable) {
                let ms = options.particles.move.speed / 2;
                p.x += p.vx * ms;
                p.y += p.vy * ms;
            }
            /* parallax */
            if (pJS.interactivity.mouse.pos_x && options.interactivity.events.onhover.parallax.enable) {
                /* smaller is the particle, longer is the offset distance */
                let tmp_x = (pJS.interactivity.mouse.pos_x - (window.innerWidth / 2)) * (p.radius / options.interactivity.events.onhover.parallax.force);

                p.offsetX += (tmp_x - p.offsetX) / options.interactivity.events.onhover.parallax.smooth; // Easing equation

                let tmp_y = ((pJS.interactivity.mouse.pos_y || 0) - (window.innerHeight / 2)) * (p.radius / options.interactivity.events.onhover.parallax.force);

                p.offsetY += (tmp_y - p.offsetY) / options.interactivity.events.onhover.parallax.smooth; // Easing equation
            }

            /* change opacity status */
            if (options.particles.opacity.anim.enable) {
                if (p.opacity_status == true) {
                    if (p.opacity >= options.particles.opacity.value)
                        p.opacity_status = false;
                    p.opacity += (p.vo || 0);
                }
                else {
                    if (p.opacity <= options.particles.opacity.anim.opacity_min)
                        p.opacity_status = true;
                    p.opacity -= (p.vo || 0);
                }
                if (p.opacity < 0)
                    p.opacity = 0;
            }

            /* change size */
            if (options.particles.size.anim.enable) {
                if (p.size_status == true) {
                    if (p.radius >= options.particles.size.value)
                        p.size_status = false;
                    p.radius += (p.vs || 0);
                }
                else {
                    if (p.radius <= options.particles.size.anim.size_min)
                        p.size_status = true;
                    p.radius -= (p.vs || 0);
                }
                if (p.radius < 0)
                    p.radius = 0;
            }
            
            /* change particle position if it is out of canvas */
            let new_pos;

            if (options.particles.move.out_mode == pJSOutMode.bounce) {
                new_pos = {
                    x_left: p.radius,
                    x_right: pJS.canvas.w,
                    y_top: p.radius,
                    y_bottom: pJS.canvas.h
                };
            }
            else {
                new_pos = {
                    x_left: -p.radius - p.offsetX,
                    x_right: pJS.canvas.w + p.radius + p.offsetX,
                    y_top: -p.radius - p.offsetY,
                    y_bottom: pJS.canvas.h + p.radius - p.offsetY
                };
            }
            if ((p.x) - p.radius > pJS.canvas.w - p.offsetX) {
                p.x = new_pos.x_left;
                p.y = Math.random() * pJS.canvas.h;
            }
            else if ((p.x) + p.radius < 0 - p.offsetX) {
                p.x = new_pos.x_right;
                p.y = Math.random() * pJS.canvas.h;
            }
            if ((p.y) - p.radius > pJS.canvas.h - p.offsetY) {
                p.y = new_pos.y_top;
                p.x = Math.random() * pJS.canvas.w;
            }
            else if ((p.y) + p.radius < 0 - p.offsetY) {
                p.y = new_pos.y_bottom;
                p.x = Math.random() * pJS.canvas.w;
            }

            /* out of canvas modes */
            switch (options.particles.move.out_mode) {
                case pJSOutMode.bounce:
                    if ((p.x + p.offsetX) + p.radius > pJS.canvas.w)
                        p.vx = -p.vx;
                    else if ((p.x + p.offsetX) - p.radius < 0)
                        p.vx = -p.vx;
                    if ((p.y + p.offsetY) + p.radius > pJS.canvas.h)
                        p.vy = -p.vy;
                    else if ((p.y + p.offsetY) - p.radius < 0)
                        p.vy = -p.vy;
                    break;
            }

            /* events */
            if (pJSUtils.isInArray(pJSHoverMode.grab, options.interactivity.events.onhover.mode)) {
                p.grab();
            }

            if (pJSUtils.isInArray(pJSHoverMode.bubble, options.interactivity.events.onhover.mode) || pJSUtils.isInArray(pJSClickMode.bubble, options.interactivity.events.onclick.mode)) {
                p.bubble();
            }

            if (pJSUtils.isInArray(pJSHoverMode.repulse, options.interactivity.events.onhover.mode) || pJSUtils.isInArray(pJSClickMode.repulse, options.interactivity.events.onclick.mode)) {
                p.repulse();
            }

            /* interaction auto between particles */
            if (options.particles.line_linked.enable || options.particles.move.attract.enable) {
                for (let j = i + 1; j < arrLength; j++) {
                    let p2 = this.array[j];

                    /* link particles */
                    if (options.particles.line_linked.enable) {
                        p.link(p2);
                    }

                    /* attract particles */
                    if (options.particles.move.attract.enable) {
                        p.attract(p2);
                    }

                    /* bounce particles */
                    if (options.particles.move.bounce) {
                        p.bounce(p2);
                    }
                }
            }
        }
    }

    draw() {
        let pJS = this.pJSContainer;

        /* clear canvas */
        if (pJS.canvas.ctx)
            pJS.canvas.ctx.clearRect(0, 0, pJS.canvas.w, pJS.canvas.h);

        /* update each particles param */
        pJS.particles.update();

        /* draw each particle */
        for (const p of this.array) {
            p.draw();
        }
    }

    empty() {
        this.array = [];
    }

    remove(nb: number) {
        var pJS = this.pJSContainer;
        var options = pJS.options;

        this.array.splice(0, nb);

        if (!options.particles.move.enable) {
            this.draw();
        }
    }

    /* ---------- pJS functions - modes events ------------ */
    push(nb: number, pos?: pJSMouseData) {
        const pJS = this.pJSContainer;
        const options = pJS.options;

        this.pushing = true;

        for (let i = 0; i < nb; i++) {
            const p = new pJSParticle(pJS, options.particles.color, options.particles.opacity.value, {
                x: pos && pos.pos_x ? pos.pos_x : Math.random() * pJS.canvas.w,
                y: pos && pos.pos_y ? pos.pos_y : Math.random() * pJS.canvas.h
            });

            this.array.push(p);
        }

        if (!options.particles.move.enable) {
            this.draw();
        }

        this.pushing = false;
    }

    async refresh() {
        let pJS = this.pJSContainer;

        /* init all */
        if (pJS.checkAnimFrame)
            window.cancelRequestAnimFrame(pJS.checkAnimFrame);

        if (pJS.drawAnimFrame)
            window.cancelRequestAnimFrame(pJS.drawAnimFrame);

        pJS.svg.source = undefined;
        pJS.svg.count = 0;
        pJS.img.obj = undefined;

        this.empty();
        
        pJS.canvas.clear();

        /* restart */
        await pJS.start();
    }
}