/**
 * FALCONTABIL - SCRIPTS GLOBAIS COMPARTILHADOS (ES6+)
 * Módulos:
 * 1. Configurações Centrais (WhatsApp, E-mail, Endpoint)
 * 2. Navbar Dinâmica e Menu Mobile Acessível
 * 3. Pré-seleção de Serviço (via URL ou clique em card)
 * 4. Formulário com Máscara, Validação em Tempo Real e Envio Real
 * 5. Galeria de Fotos com Filtros e Lightbox Modal
 */
(() => {
    'use strict';

    /* ======================================================================
       1. CONFIGURAÇÃO CENTRAL DA EMPRESA (Edite apenas aqui para todo o site)
       ====================================================================== */
    const FALCONTABIL_CONFIG = {
        whatsappNumber: '5521999999999', // DDI (55) + DDD (21) + Número sem espaços
        whatsappDisplay: '(21) 99999-9999',
        emailDestino: 'contato@e-falcontabil.com.br',
        formEndpoint: '' // Opcional: Ex. 'https://formspree.io/f/seu-codigo'
    };

    const syncGlobalContactLinks = () => {
        document.querySelectorAll('[data-whatsapp-link]').forEach((el) => {
            const customMsg = el.getAttribute('data-whatsapp-msg') ||
                'Olá! Vim pelo site da Falcontabil e gostaria de atendimento.';
            el.setAttribute(
                'href',
                `https://wa.me/${FALCONTABIL_CONFIG.whatsappNumber}?text=${encodeURIComponent(customMsg)}`
            );
        });

        document.querySelectorAll('[data-whatsapp-text]').forEach((el) => {
            el.textContent = FALCONTABIL_CONFIG.whatsappDisplay;
        });

        document.querySelectorAll('[data-email-link]').forEach((el) => {
            el.setAttribute('href', `mailto:${FALCONTABIL_CONFIG.emailDestino}`);
            el.textContent = FALCONTABIL_CONFIG.emailDestino;
        });

        document.querySelectorAll('[data-current-year]').forEach((el) => {
            el.textContent = String(new Date().getFullYear());
        });
    };

    /* ======================================================================
       2. NAVBAR DINÂMICA & MENU MOBILE ACESSÍVEL
       ====================================================================== */
    const initNavigation = () => {
        const navbar = document.getElementById('navbar');
        const menuBtn = document.getElementById('menuBtn');
        const menuIcon = document.getElementById('menuIcon');
        const mobileMenu = document.getElementById('mobileMenu');

        if (navbar) {
            const handleScroll = () => {
                if (window.scrollY > 20) {
                    navbar.classList.add('shadow-md');
                    navbar.classList.remove('shadow-sm');
                } else {
                    navbar.classList.add('shadow-sm');
                    navbar.classList.remove('shadow-md');
                }
            };
            window.addEventListener('scroll', handleScroll, { passive: true });
            handleScroll();
        }

        if (!menuBtn || !mobileMenu) return;

        const toggleMobileMenu = (forceClose = false) => {
            const isOpen = !mobileMenu.classList.contains('hidden');
            const shouldOpen = forceClose ? false : !isOpen;

            mobileMenu.classList.toggle('hidden', !shouldOpen);
            menuBtn.setAttribute('aria-expanded', String(shouldOpen));
            menuBtn.setAttribute(
                'aria-label',
                shouldOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'
            );

            if (menuIcon) {
                menuIcon.classList.toggle('fa-bars', !shouldOpen);
                menuIcon.classList.toggle('fa-xmark', shouldOpen);
            }
        };

        menuBtn.addEventListener('click', () => toggleMobileMenu());

        mobileMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => toggleMobileMenu(true));
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
                toggleMobileMenu(true);
                menuBtn.focus();
            }
        });
    };

    /* ======================================================================
       3. PRÉ-SELEÇÃO DE SERVIÇO (POR QUERY STRING ?servico=... OU CTA LOCAL)
       ====================================================================== */
    const initServicePreselection = () => {
        const servicoSelect = document.getElementById('servico');
        if (!servicoSelect) return;

        // Via URL (ex: contato.html?servico=Perícia%20Trabalhista)
        const params = new URLSearchParams(window.location.search);
        const serviceFromUrl = params.get('servico');
        if (serviceFromUrl) {
            const matchingOption = Array.from(servicoSelect.options).find(
                (opt) => opt.value.toLowerCase() === serviceFromUrl.toLowerCase()
            );
            if (matchingOption) {
                servicoSelect.value = matchingOption.value;
            }
        }

        // Via clique em cards na mesma página
        document.querySelectorAll('.service-cta').forEach((cta) => {
            cta.addEventListener('click', () => {
                const selectedService = cta.getAttribute('data-service');
                if (selectedService) {
                    servicoSelect.value = selectedService;
                }
            });
        });
    };

    /* ======================================================================
       4. FORMULÁRIO DE CONTATO COM VALIDAÇÃO EM TEMPO REAL E ENVIO REAL
       ====================================================================== */
    const initContactForm = () => {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;

        const formFeedback = document.getElementById('formFeedback');
        const submitBtn = document.getElementById('submitBtn');
        const submitBtnText = document.getElementById('submitBtnText');

        const fields = {
            nome: document.getElementById('nome'),
            empresa: document.getElementById('empresa'),
            email: document.getElementById('email'),
            telefone: document.getElementById('telefone'),
            servico: document.getElementById('servico'),
            mensagem: document.getElementById('mensagem')
        };

        const formatPhone = (value) => {
            const digits = value.replace(/\D/g, '').slice(0, 11);
            if (digits.length <= 2) return digits.length ? `(${digits}` : '';
            if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
            if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
            return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
        };

        if (fields.telefone) {
            fields.telefone.addEventListener('input', (e) => {
                e.target.value = formatPhone(e.target.value);
            });
        }

        const validators = {
            nome: (value) => {
                if (!value.trim()) return 'Por favor, informe seu nome completo.';
                if (value.trim().length < 3) return 'O nome deve ter pelo menos 3 caracteres.';
                return '';
            },
            email: (value) => {
                if (!value.trim()) return 'Por favor, informe seu e-mail.';
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
                if (!emailRegex.test(value.trim())) return 'Informe um endereço de e-mail válido.';
                return '';
            },
            telefone: (value) => {
                const digits = value.replace(/\D/g, '');
                if (!digits) return 'Por favor, informe seu telefone ou WhatsApp.';
                if (digits.length < 10) return 'Informe um número válido com DDD (10 ou 11 dígitos).';
                return '';
            },
            mensagem: (value) => {
                if (!value.trim()) return 'Por favor, descreva como podemos ajudar.';
                if (value.trim().length < 10) return 'Escreva uma mensagem com pelo menos 10 caracteres.';
                return '';
            }
        };

        const setFieldState = (fieldName, errorMessage) => {
            const input = fields[fieldName];
            const errorEl = document.getElementById(`${fieldName}-error`);
            if (!input || !errorEl) return true;

            if (errorMessage) {
                input.classList.add('form-input-error');
                input.classList.remove('form-input-success');
                input.setAttribute('aria-invalid', 'true');
                errorEl.textContent = errorMessage;
                errorEl.classList.remove('hidden');
                return false;
            }

            input.classList.remove('form-input-error');
            input.classList.add('form-input-success');
            input.setAttribute('aria-invalid', 'false');
            errorEl.textContent = '';
            errorEl.classList.add('hidden');
            return true;
        };

        Object.keys(validators).forEach((fieldName) => {
            const input = fields[fieldName];
            if (!input) return;

            input.addEventListener('blur', () => {
                setFieldState(fieldName, validators[fieldName](input.value));
            });

            input.addEventListener('input', () => {
                if (input.getAttribute('aria-invalid') === 'true' || input.value.trim().length > 0) {
                    setFieldState(fieldName, validators[fieldName](input.value));
                }
            });
        });

        const showFeedback = (type, htmlContent) => {
            if (!formFeedback) return;
            formFeedback.className = 'p-4 rounded-lg text-sm font-medium mt-4';
            if (type === 'success') {
                formFeedback.classList.add('bg-green-50', 'text-green-900', 'border', 'border-green-200');
            } else {
                formFeedback.classList.add('bg-red-50', 'text-red-900', 'border', 'border-red-200');
            }
            formFeedback.innerHTML = htmlContent;
            formFeedback.classList.remove('hidden');
        };

        const buildWhatsAppUrl = (data) => {
            const texto = [
                '*Nova Solicitação pelo Site - Falcontabil*',
                `*Nome:* ${data.nome}`,
                data.empresa ? `*Empresa:* ${data.empresa}` : null,
                `*E-mail:* ${data.email}`,
                `*Telefone:* ${data.telefone}`,
                data.servico ? `*Serviço:* ${data.servico}` : null,
                `*Mensagem:* ${data.mensagem}`
            ].filter(Boolean).join('\n');

            return `https://wa.me/${FALCONTABIL_CONFIG.whatsappNumber}?text=${encodeURIComponent(texto)}`;
        };

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            let isFormValid = true;
            let firstInvalidField = null;

            Object.keys(validators).forEach((fieldName) => {
                const input = fields[fieldName];
                if (!input) return;
                const valid = setFieldState(fieldName, validators[fieldName](input.value));
                if (!valid) {
                    isFormValid = false;
                    if (!firstInvalidField) firstInvalidField = input;
                }
            });

            if (!isFormValid) {
                showFeedback(
                    'error',
                    '<i class="fa-solid fa-circle-exclamation mr-2" aria-hidden="true"></i>Verifique os campos destacados em vermelho antes de enviar.'
                );
                if (firstInvalidField) firstInvalidField.focus();
                return;
            }

            const payload = {
                nome: fields.nome.value.trim(),
                empresa: fields.empresa ? fields.empresa.value.trim() : '',
                email: fields.email.value.trim(),
                telefone: fields.telefone.value.trim(),
                servico: fields.servico ? fields.servico.value : '',
                mensagem: fields.mensagem.value.trim()
            };

            const originalBtnText = submitBtnText ? submitBtnText.textContent : 'Enviar';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
            }
            if (submitBtnText) submitBtnText.textContent = 'Processando...';

            const whatsappUrl = buildWhatsAppUrl(payload);

            try {
                if (FALCONTABIL_CONFIG.formEndpoint) {
                    const response = await fetch(FALCONTABIL_CONFIG.formEndpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) throw new Error('Erro ao enviar formulário');

                    showFeedback(
                        'success',
                        `Solicitação enviada com sucesso! Nossa equipe responderá em breve. Caso prefira atendimento imediato, <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="underline font-bold">clique aqui para falar no WhatsApp</a>.`
                    );
                } else {
                    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
                    showFeedback(
                        'success',
                        `Sua mensagem foi preparada para o WhatsApp da Falcontabil! Se a janela não abriu automaticamente, <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="underline font-bold">clique aqui para enviar agora</a>.`
                    );
                }

                contactForm.reset();
                Object.keys(validators).forEach((fieldName) => {
                    const input = fields[fieldName];
                    if (input) {
                        input.classList.remove('form-input-success', 'form-input-error');
                        input.removeAttribute('aria-invalid');
                    }
                });
            } catch (err) {
                showFeedback(
                    'error',
                    `Não foi possível enviar pelo servidor no momento. <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="underline font-bold">Clique aqui para enviar diretamente pelo WhatsApp</a>.`
                );
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
                }
                if (submitBtnText) submitBtnText.textContent = originalBtnText;
            }
        });
    };

    /* ======================================================================
       5. GALERIA DE FOTOS COM FILTROS E LIGHTBOX MODAL (PÁGINA SOBRE NÓS)
       ====================================================================== */
    const initGalleryAndLightbox = () => {
        const galleryGrid = document.getElementById('galleryGrid');
        const lightbox = document.getElementById('photoLightbox');
        if (!galleryGrid) return;

        const filterButtons = document.querySelectorAll('.gallery-filter-btn');
        const galleryItems = Array.from(galleryGrid.querySelectorAll('.gallery-item'));

        filterButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');

                filterButtons.forEach((b) => {
                    b.classList.remove('is-active');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('is-active');
                btn.setAttribute('aria-pressed', 'true');

                galleryItems.forEach((item) => {
                    const category = item.getAttribute('data-category');
                    const shouldShow = filter === 'all' || category === filter;
                    item.classList.toggle('hidden', !shouldShow);
                });
            });
        });

        if (!lightbox) return;

        const lightboxImg = document.getElementById('lightboxImg');
        const lightboxTitle = document.getElementById('lightboxTitle');
        const lightboxDesc = document.getElementById('lightboxDesc');
        const lightboxClose = document.getElementById('lightboxClose');
        const lightboxPrev = document.getElementById('lightboxPrev');
        const lightboxNext = document.getElementById('lightboxNext');

        let visibleTriggers = [];
        let currentIndex = 0;
        let lastFocusedElement = null;

        const updateVisibleTriggers = () => {
            visibleTriggers = galleryItems
                .filter((item) => !item.classList.contains('hidden'))
                .map((item) => item.querySelector('.gallery-trigger'))
                .filter(Boolean);
        };

        const renderSlide = (index) => {
            if (!visibleTriggers.length) return;
            currentIndex = (index + visibleTriggers.length) % visibleTriggers.length;
            const trigger = visibleTriggers[currentIndex];
            const img = trigger.querySelector('img');
            const title = trigger.querySelector('h3');
            const desc = trigger.querySelector('p');

            if (img && lightboxImg) {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
            }
            if (lightboxTitle) lightboxTitle.textContent = title ? title.textContent : '';
            if (lightboxDesc) lightboxDesc.textContent = desc ? desc.textContent : '';
        };

        const openLightbox = (trigger) => {
            updateVisibleTriggers();
            const idx = visibleTriggers.indexOf(trigger);
            lastFocusedElement = document.activeElement;
            renderSlide(idx >= 0 ? idx : 0);
            lightbox.classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
            if (lightboxClose) lightboxClose.focus();
        };

        const closeLightbox = () => {
            lightbox.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
            if (lastFocusedElement) lastFocusedElement.focus();
        };

        galleryItems.forEach((item) => {
            const trigger = item.querySelector('.gallery-trigger');
            if (trigger) {
                trigger.addEventListener('click', () => openLightbox(trigger));
            }
        });

        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        if (lightboxPrev) lightboxPrev.addEventListener('click', () => renderSlide(currentIndex - 1));
        if (lightboxNext) lightboxNext.addEventListener('click', () => renderSlide(currentIndex + 1));

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', (e) => {
            if (lightbox.classList.contains('hidden')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') renderSlide(currentIndex - 1);
            if (e.key === 'ArrowRight') renderSlide(currentIndex + 1);
        });
    };

    /* ======================================================================
       INICIALIZAÇÃO
       ====================================================================== */
    document.addEventListener('DOMContentLoaded', () => {
        syncGlobalContactLinks();
        initNavigation();
        initServicePreselection();
        initContactForm();
        initGalleryAndLightbox();
    });
})();