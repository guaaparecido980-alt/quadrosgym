/* ==========================================================================
   QUADROS GYM — INTERACTIVE LAYER
   Tudo com typeof checks: o site NUNCA quebra se uma CDN falhar.
   ========================================================================== */

(function () {
    'use strict';

    const isMobile = window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window;
    const isDesktop = window.matchMedia('(min-width: 992px)').matches && matchMedia('(hover: hover)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ----------------------------------------------------------------------
       1. SMOOTH SCROLL (Lenis) — desktop only
       ---------------------------------------------------------------------- */
    let lenis = null;
    if (typeof Lenis !== 'undefined' && !isMobile && !reduceMotion) {
        try {
            lenis = new Lenis({
                duration: 1.15,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                smoothWheel: true,
                syncTouch: false,
            });
            function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
            requestAnimationFrame(raf);
        } catch (e) { lenis = null; }
    }

    /* ----------------------------------------------------------------------
       2. GSAP + ScrollTrigger setup
       ---------------------------------------------------------------------- */
    const hasGSAP = typeof gsap !== 'undefined';
    const hasST = hasGSAP && typeof ScrollTrigger !== 'undefined';
    if (hasST) {
        gsap.registerPlugin(ScrollTrigger);
        if (lenis) {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => lenis.raf(time * 1000));
            gsap.ticker.lagSmoothing(0);
        }
    }
    // Sem GSAP: usa IntersectionObserver para os reveals
    if (!hasGSAP) document.documentElement.classList.add('no-gsap');

    document.addEventListener('DOMContentLoaded', init);
    if (document.readyState !== 'loading') init();
    let started = false;

    function init() {
        if (started) return; started = true;

        /* ------------------------------------------------------------------
           3. SCROLL ANIMATIONS — Estrategia A (gsap.from), nunca opacity:0 no CSS
           ------------------------------------------------------------------ */
        if (hasGSAP && !reduceMotion) {
            // Hero entrance
            const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
            // Entrada por linha (preserva text-wrap: balance, ao contrario do SplitType por palavra)
            heroTl.from('.hero-title', { opacity: 0, y: 44, duration: 1.1 });
            heroTl.from('.hero .eyebrow', { opacity: 0, y: 20, duration: 0.6 }, 0)
                  .from('.hero-sub', { opacity: 0, y: 24, duration: 0.7 }, '-=0.5')
                  .from('.hero-bullets li', { opacity: 0, y: 18, duration: 0.5, stagger: 0.08 }, '-=0.4')
                  .from('.hero-actions', { opacity: 0, y: 20, duration: 0.6 }, '-=0.3')
                  .from('.hero-microcopy', { opacity: 0, duration: 0.6 }, '-=0.4');

            // Animacoes de scroll SOMENTE no desktop (mobile = conteudo estatico, sem risco de texto sumir)
            if (hasST && !isMobile) {
                // Reveal staggered por seção (cascata)
                gsap.utils.toArray('.section').forEach((section) => {
                    if (section.classList.contains('compare')) return; // tratado a parte (efeito wow)
                    const items = section.querySelectorAll('.section-head, .reveal, .step, .struct-card, .fit-col, .journey li, .pain');
                    if (!items.length) return;
                    gsap.from(items, {
                        opacity: 0, y: 40, duration: 0.8, stagger: 0.08, ease: 'power3.out',
                        scrollTrigger: { trigger: section, start: 'top 82%', toggleActions: 'play none none none' }
                    });
                });

                // Parallax sutil no hero (desktop)
                if (!isMobile) {
                    gsap.to('.hero-img', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
                }

                // COMPARATIVO — entrada + efeito "wow"
                const compareCols = gsap.utils.toArray('.compare-col');
                const compareExtra = document.querySelectorAll('.compare .section-head, .compare .section-cta');
                if (compareExtra.length) {
                    gsap.from(compareExtra, { opacity: 0, y: 40, duration: 0.8, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.compare', start: 'top 80%' } });
                }
                if (compareCols.length) {
                    gsap.from(compareCols, { opacity: 0, y: 40, duration: 0.8, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: '.compare-grid', start: 'top 82%' } });
                    if (!isMobile) {
                        // WOW: academia comum perde foco, Quadros ganha destaque conforme o scroll
                        const common = document.querySelector('.col-common');
                        const quadros = document.querySelector('.col-quadros');
                        if (common && quadros) {
                            gsap.to(common, { opacity: 0.45, filter: 'blur(2px)', scale: 0.97, ease: 'none', scrollTrigger: { trigger: '.compare-grid', start: 'center 70%', end: 'bottom 40%', scrub: 1 } });
                            gsap.to(quadros, { scale: 1.03, ease: 'none', scrollTrigger: { trigger: '.compare-grid', start: 'center 70%', end: 'bottom 40%', scrub: 1 } });
                        }
                    }
                }
            }
        } else if (!hasGSAP) {
            // Fallback sem GSAP
            const io = new IntersectionObserver((entries) => {
                entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
            }, { threshold: 0.12 });
            document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
        }

        /* ------------------------------------------------------------------
           4. CUSTOM CURSOR (desktop)
           ------------------------------------------------------------------ */
        if (isDesktop) {
            const cur = document.querySelector('.custom-cursor');
            const dot = document.querySelector('.custom-cursor-dot');
            if (cur && dot) {
                let cx = 0, cy = 0, x = 0, y = 0;
                document.addEventListener('mousemove', (e) => {
                    cx = e.clientX; cy = e.clientY;
                    dot.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
                });
                (function follow() {
                    x += (cx - x) * 0.18; y += (cy - y) * 0.18;
                    cur.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
                    requestAnimationFrame(follow);
                })();
                document.querySelectorAll('a, button, .opt-btn, .struct-card, .faq-q, input, select, .journey li').forEach((el) => {
                    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
                    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
                });
            }
        }

        /* ------------------------------------------------------------------
           5. NAVBAR scroll state + mobile menu
           ------------------------------------------------------------------ */
        const navbar = document.getElementById('navbar');
        const onScroll = () => { if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40); };
        window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

        const toggle = document.getElementById('mobile-toggle');
        const menu = document.getElementById('nav-menu');
        if (toggle && menu) {
            const setOpen = (open) => {
                toggle.classList.toggle('active', open);
                menu.classList.toggle('active', open);
                toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
                document.body.style.overflow = open ? 'hidden' : '';
            };
            toggle.addEventListener('click', () => setOpen(!menu.classList.contains('active')));
            menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
        }

        // Smooth anchor (respeita Lenis se ativo)
        document.querySelectorAll('a[href^="#"]').forEach((a) => {
            a.addEventListener('click', (e) => {
                const id = a.getAttribute('href');
                if (id.length < 2) return;
                const target = document.querySelector(id);
                if (!target) return;
                e.preventDefault();
                if (lenis) lenis.scrollTo(target, { offset: -70 });
                else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
            });
        });

        /* ------------------------------------------------------------------
           6. 3D TILT (desktop only)
           ------------------------------------------------------------------ */
        if (isDesktop && !reduceMotion) {
            document.querySelectorAll('[data-tilt]').forEach((card) => {
                card.addEventListener('mousemove', (e) => {
                    const r = card.getBoundingClientRect();
                    const px = (e.clientX - r.left) / r.width - 0.5;
                    const py = (e.clientY - r.top) / r.height - 0.5;
                    card.style.transform = `perspective(900px) rotateX(${-py * 7}deg) rotateY(${px * 7}deg) translateY(-4px)`;
                });
                card.addEventListener('mouseleave', () => { card.style.transform = ''; });
            });
        }

        /* ------------------------------------------------------------------
           7. SIMULADOR DE METAS
           ------------------------------------------------------------------ */
        const answers = { 1: '', 2: '', 3: '' };
        const steps = ['step-1', 'step-2', 'step-3', 'step-result'];
        const dots = document.querySelectorAll('.wizard-progress .progress-dot');

        function showStep(idx) {
            steps.forEach((id, i) => document.getElementById(id)?.classList.toggle('active', i === idx));
            dots.forEach((d, i) => d.classList.toggle('active', i <= Math.min(idx, 2)));
        }

        document.querySelectorAll('.opt-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const step = btn.dataset.step;
                answers[step] = btn.dataset.value;
                if (step === '1') showStep(1);
                else if (step === '2') showStep(2);
                else if (step === '3') { computeResult(); showStep(3); }
            });
        });
        document.querySelectorAll('[data-back]').forEach((b) => {
            b.addEventListener('click', () => {
                const t = b.dataset.back;
                if (t === 'restart') { answers[1] = answers[2] = answers[3] = ''; showStep(0); }
                else showStep(parseInt(t, 10) - 1);
            });
        });

        function computeResult() {
            const goalMap = {
                hipertrofia: ['QG HYPERTROPHY', 'foco em ganho de massa magra e força, com periodização planejada e correção de execução de perto.'],
                emagrecimento: ['QG METABOLIC', 'queima de gordura combinando treino de força e condicionamento, em um fluxo organizado por horário.'],
                saude: ['QG LONGEVITY', 'saúde, postura, mobilidade e fortalecimento articular para qualidade de vida e consistência.'],
                condicionamento: ['QG CONDITION', 'evolução de fôlego, resistência e performance com treinos estruturados e progressivos.'],
                constancia: ['QG RESTART', 'retomada inteligente da rotina, com acompanhamento próximo para você não desistir de novo.']
            };
            const [name, focus] = goalMap[answers[1]] || ['QG PERFORMANCE', 'um treino acompanhado e planejado para a sua meta.'];
            const resName = document.getElementById('res-name');
            const resDesc = document.getElementById('res-desc');
            const cta = document.getElementById('wizard-cta');
            if (resName) resName.textContent = name;
            if (resDesc) resDesc.textContent = `Seu perfil combina com ${focus} Na Quadros Gym, isso acontece com horário marcado, no máximo 3 alunos por professor e um ambiente sem superlotação — mais direção, conforto e previsibilidade.`;
            if (cta) {
                const params = new URLSearchParams({ perfil: name, objetivo: answers[1] || '', rotina: answers[2] || '' });
                cta.href = `https://app.tecnofit.com.br/ng/customer-register/MTk5NDUy?${params.toString()}`;
            }
        }

        /* ------------------------------------------------------------------
           8. FAQ ACCORDION (acessível)
           ------------------------------------------------------------------ */
        document.querySelectorAll('.faq-item').forEach((item) => {
            const q = item.querySelector('.faq-q');
            const a = item.querySelector('.faq-a');
            if (!q || !a) return;
            q.addEventListener('click', () => {
                const open = item.classList.contains('open');
                // fecha os demais
                document.querySelectorAll('.faq-item.open').forEach((other) => {
                    if (other !== item) { other.classList.remove('open'); other.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false'); const oa = other.querySelector('.faq-a'); if (oa) oa.style.maxHeight = null; }
                });
                item.classList.toggle('open', !open);
                q.setAttribute('aria-expanded', !open ? 'true' : 'false');
                a.style.maxHeight = !open ? a.scrollHeight + 'px' : null;
            });
        });

        /* ------------------------------------------------------------------
           9. LED "Aberta agora" (horário de Curitiba, UTC-3)
           ------------------------------------------------------------------ */
        function updateStatus() {
            const dot = document.getElementById('live-dot');
            const text = document.getElementById('live-text');
            if (!dot || !text) return;
            const now = new Date();
            const ctba = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
            const day = ctba.getDay();
            const t = ctba.getHours() + ctba.getMinutes() / 60;
            let open = false, msg = '';
            if (day >= 1 && day <= 5) { open = t >= 6 && t < 22; msg = open ? 'Aberta agora · fecha às 22:00' : (t < 6 ? 'Fechada · abre hoje às 06:00' : 'Fechada · abre amanhã às 06:00'); }
            else if (day === 6) { open = t >= 8 && t < 14; msg = open ? 'Aberta agora · fecha às 14:00' : (t < 8 ? 'Fechada · abre hoje às 08:00' : 'Fechada · abre segunda às 06:00'); }
            else { open = false; msg = 'Fechada · abre segunda às 06:00'; }
            dot.className = 'live-dot ' + (open ? 'open' : 'closed');
            text.textContent = msg;
        }
        updateStatus(); setInterval(updateStatus, 30000);

        /* ------------------------------------------------------------------
           10. STICKY MOBILE CTA (aparece depois do hero, some no rodapé)
           ------------------------------------------------------------------ */
        const sticky = document.getElementById('sticky-cta');
        if (sticky) {
            const hero = document.getElementById('home');
            const footer = document.querySelector('.footer');
            const sIo = new IntersectionObserver((entries) => {
                entries.forEach((e) => {
                    if (e.target === hero) sticky.classList.toggle('show', !e.isIntersecting);
                    if (e.target === footer && e.isIntersecting) sticky.classList.remove('show');
                });
            }, { threshold: 0.1 });
            if (hero) sIo.observe(hero);
            if (footer) sIo.observe(footer);
        }

        /* ------------------------------------------------------------------
           11. Magnetic buttons (desktop)
           ------------------------------------------------------------------ */
        if (isDesktop && !reduceMotion) {
            document.querySelectorAll('.btn-magnetic').forEach((btn) => {
                btn.addEventListener('mousemove', (e) => {
                    const r = btn.getBoundingClientRect();
                    btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
                });
                btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
            });
        }

        /* ------------------------------------------------------------------
           12. COOKIE CONSENT (LGPD)
           ------------------------------------------------------------------ */
        const banner = document.getElementById('cookie-banner');
        if (banner) {
            let consent = null;
            try { consent = localStorage.getItem('qg-cookie-consent'); } catch (e) {}
            if (!consent) banner.classList.add('show');
            const decide = (value) => {
                try { localStorage.setItem('qg-cookie-consent', value); } catch (e) {}
                banner.classList.remove('show');
            };
            document.getElementById('cookie-accept')?.addEventListener('click', () => decide('accepted'));
            document.getElementById('cookie-reject')?.addEventListener('click', () => decide('rejected'));
        }

        if (hasST) ScrollTrigger.refresh();
    }
})();
