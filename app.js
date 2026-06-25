/* ==========================================================================
   INTERACTIVE LOGIC - QUADROS GYM
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // 1. CUSTOM CURSOR
    const cursor = document.querySelector('.custom-cursor');
    const cursorDot = document.querySelector('.custom-cursor-dot');
    
    if (cursor && cursorDot) {
        document.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;
            
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;
            
            cursor.style.left = `${posX}px`;
            cursor.style.top = `${posY}px`;
        });

        // Expand cursor on hover
        const interactives = document.querySelectorAll('a, button, select, input, label, .struct-card, .opt-btn, .position-item');
        interactives.forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('hovered');
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('hovered');
            });
        });
    }

    // 2. MOBILE MENU TOGGLE
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                navMenu.classList.remove('active');
                
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    // 3. NAVBAR SCROLL EFFECT
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });

    // 4. 3D TILT EFFECT
    const tiltCards = document.querySelectorAll('[data-tilt]');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const tiltX = (centerY - y) / 12;
            const tiltY = (x - centerX) / 12;
            
            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });

    // 5. GOAL WIZARD SIMULATOR
    let selectedGoal = '';
    let selectedFreq = '';

    const step1Btns = document.querySelectorAll('#step-1 .opt-btn');
    const step2Btns = document.querySelectorAll('#step-2 .opt-btn');

    step1Btns.forEach(btn => {
        btn.addEventListener('click', () => {
            selectedGoal = btn.dataset.goal;
            goToStep(2);
        });
    });

    step2Btns.forEach(btn => {
        btn.addEventListener('click', () => {
            selectedFreq = btn.dataset.freq;
            calculateResult();
            goToStep(3);
        });
    });

    window.goToStep = function(stepNum) {
        // Toggle step active states
        document.querySelectorAll('.wizard-step').forEach(step => {
            step.classList.remove('active');
        });
        document.getElementById(`step-${stepNum}`).classList.add('active');

        // Update progress dots
        document.querySelectorAll('.progress-dot').forEach((dot, idx) => {
            if (idx < stepNum) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    };

    function calculateResult() {
        const resTitle = document.getElementById('res-profile-name');
        const resDesc = document.getElementById('res-profile-desc');
        const tecnofitCta = document.getElementById('wizard-tecnofit-cta');

        let profileName = 'QG ACTIVE';
        let profileDesc = '';

        if (selectedGoal === 'hipertrofia') {
            if (selectedFreq === '4-5') {
                profileName = 'QG ELITE HYPERTROPHY';
                profileDesc = 'Seu perfil indica foco absoluto em ganho de massa magra e performance. Recomendamos agendamento planejado de 4 a 5 treinos semanais com suporte biomecânico de força.';
            } else {
                profileName = 'QG ACTIVE GAINS';
                profileDesc = 'Seu perfil indica foco em fortalecimento e hipertrofia de forma flexível. Foco em treinos estruturados de alta densidade 3x por semana.';
            }
        } else if (selectedGoal === 'emagrecimento') {
            if (selectedFreq === '4-5') {
                profileName = 'QG METABOLIC SHRED';
                profileDesc = 'Perfil de queima metabólica máxima e definição corporal. Recomendamos treinos híbridos de força combinados com nossa área de cardio tecnológico com hora marcada.';
            } else {
                profileName = 'QG CARDIO FOCUS';
                profileDesc = 'Ideal para perda de gordura corporal associando condicionamento cardiorrespiratório e tonificação de forma ágil e inteligente.';
            }
        } else if (selectedGoal === 'saude') {
            if (selectedFreq === '4-5') {
                profileName = 'QG LONGEVITY PRO';
                profileDesc = 'Foco em saúde postural, flexibilidade e fortalecimento articular contínuo para qualidade de vida diária.';
            } else {
                profileName = 'QG ACTIVE WELLNESS';
                profileDesc = 'Indicado para manutenção de energia corporal, alívio de estresse e bem-estar físico geral através de treinos estimulantes.';
            }
        }

        resTitle.textContent = profileName;
        resDesc.textContent = profileDesc;

        // Custom checkout parameters if necessary, here we redirect directly to Tecnofit
        const registrationLink = `https://app.tecnofit.com.br/ng/customer-register/MTk5NDUy?profile=${encodeURIComponent(profileName)}`;
        tecnofitCta.href = registrationLink;
    }

    // 6. REAL-TIME BUSINESS STATUS
    function checkBusinessHours() {
        const dot = document.getElementById('live-dot');
        const text = document.getElementById('live-status-text');

        if (!dot || !text) return;

        // Curitiba Local Time (UTC-3)
        const now = new Date();
        const curitibaDate = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));

        const day = curitibaDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const hour = curitibaDate.getHours();
        const minutes = curitibaDate.getMinutes();
        const decimalTime = hour + minutes / 60;

        let isOpen = false;
        let msg = '';

        if (day >= 1 && day <= 5) { // Monday to Friday: 06:00 to 22:00
            if (decimalTime >= 6.0 && decimalTime < 22.0) {
                isOpen = true;
                msg = 'Aberto agora · Fecha às 22:00';
            } else {
                isOpen = false;
                msg = 'Fechado · Abre amanhã às 06:00';
            }
        } else if (day === 6) { // Saturday: 08:00 to 14:00
            if (decimalTime >= 8.0 && decimalTime < 14.0) {
                isOpen = true;
                msg = 'Aberto agora · Fecha às 14:00';
            } else {
                isOpen = false;
                msg = 'Fechado · Abre segunda às 06:00';
            }
        } else { // Sunday: Closed
            isOpen = false;
            msg = 'Fechado · Abre segunda às 06:00';
        }

        if (isOpen) {
            dot.className = 'live-status-dot open';
            text.innerHTML = `<span class="purple-glow-text">${msg}</span>`;
        } else {
            dot.className = 'live-status-dot closed';
            text.innerHTML = `<span class="text-muted">${msg}</span>`;
        }
    }

    checkBusinessHours();
    setInterval(checkBusinessHours, 30000); // refresh every 30s

    // 7. CAREERS WHATSAPP SUBMIT
    const applyForm = document.getElementById('apply-form');
    if (applyForm) {
        applyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('candidate-name').value;
            const role = document.getElementById('candidate-role').value;
            
            const message = encodeURIComponent(`Olá, QG Team! Meu nome é ${name} e tenho interesse na vaga de ${role}. Gostaria de enviar meu currículo para avaliação.`);
            
            // Redirect to WhatsApp
            window.open(`https://wa.me/5541999999999?text=${message}`, '_blank');
        });
    }

    // 8. SCROLL REVEALS
    const revealElements = document.querySelectorAll('.reveal-fade, .reveal-slide-up, .reveal-slide-left, .reveal-slide-right');
    
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

});
