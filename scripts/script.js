document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const getData = (url, callback) => {
        const request = new XMLHttpRequest();
        request.open('GET', url) //POST GET PUT  DELETE
        request.send();
        request.addEventListener('readystatechange', () => {
            if (request.readyState !== 4) return;
            if (request.status === 200) {
                const response = JSON.parse(request.response);
                callback(response);

            } else {
                console.error(new Error('ошибка' + request.status));
            }

        });
    }



    const tabs = () => {

        const cardDetailChangeElems = document.querySelectorAll('.card-detail__change');
        const cardDetailsTitleElem = document.querySelector('.card-details__title');
        const cardImageItemElem = document.querySelector('.card__image_item');
        const cardDetailPriseElem = document.querySelector('.card-details__price');
        const descriptionMemoryelem = document.querySelector('.description__memory');

        const data = [{
                name: 'Смартфон Apple iPhone 12 Pro 128GB Graphite',
                img: 'img/iPhone-graphite.png',
                price: '95990',
                memoryROM: 128
            },
            {
                name: 'Смартфон Apple iPhone 12 Pro 512GB Silver',
                img: 'img/iPhone-silver.png',
                price: '150990',
                memoryROM: 512
            },
            {
                name: 'Смартфон Apple iPhone 12 Pro 256GB Pacific Blue',
                img: 'img/iPhone-blue.png',
                price: '120990',
                memoryROM: 256
            },
        ];

        const deactive = () => {
            cardDetailChangeElems.forEach(btn => btn.classList.remove('active'))
        }
        cardDetailChangeElems.forEach((btn, i) => {
            btn.addEventListener('click', () => {
                if (!btn.classList.contains('active')) {
                    deactive();
                    btn.classList.add('active')

                    cardDetailsTitleElem.textContent = data[i].name;
                    cardImageItemElem.src = data[i].img;
                    cardImageItemElem.alt = data[i].name;
                    cardDetailPriseElem.textContent = data[i].price + ' ₽';
                    descriptionMemoryelem.textContent = `Встроенная память (ROM) ${data[i].memoryROM} ГБ`;
                }
            });
        });

    };


    const accordion = () => {

        const characteristicsListElem = document.querySelector('.characteristics__list'); //список родитель -  юл
        const characteristicsitemElems = document.querySelectorAll('.characteristics__item'); //лишки

        //
        const open = (button, dropDown) => {
            //closeAllDrops();
            dropDown.style.height = `${dropDown.scrollHeight}px`;
            button.classList.add('active');
            dropDown.classList.add('active');
        };

        const close = (button, dropDown) => {
            button.classList.remove('active');
            dropDown.classList.remove('active');
            dropDown.style.height = '';
        };

        const closeAllDrops = () => {
            characteristicsitemElems.forEach((elem) => {
                close(elem.children[0], elem.children[1]);
            })
        }

        characteristicsListElem.addEventListener('click', (event) => {
            const target = event.target;

            if (target.classList.contains('characteristics__title')) {
                const parent = target.closest('.characteristics__item');
                const description = parent.querySelector('.characteristics__description');
                description.classList.contains('active') ?
                    close(target, description) :
                    open(target, description);

            }
        });

        document.body.addEventListener('click', (event) => {
            const target = event.target;
            if (!target.closest('.characteristics__list')) {
                closeAllDrops();
            }
        })

    };




    const renderCrossSell = () => {

        const crossSellList = document.querySelector('.cross-sell__list');
        const crossSellAdd = document.querySelector('.cross-sell__add');

        const createCrossSellItem = good => {

            const liItem = document.createElement('li');
            liItem.innerHTML = `
            <article class="cross-sell__item">
            <img class="cross-sell__image" src="${good.photo}" alt="">
            <h3 class="cross-sell__title">${good.name}</h3>
            <p class="cross-sell__price">${good.price}</p>
            <button  class="button button_buy cross-sell__button" data-button-buy="Оплата и доставка">Купить</button>
            </article>
            
        `;
            return liItem;
        }

        const renderRandomGoods = (goods, arr) => {
            let a = arr.length < 4 ? arr.length : 4;
            for (let i = 0; i < a; i++) {
                crossSellList.append(createCrossSellItem(goods[arr.splice(0, 1)])); //выводим товар с индексом из arr и сразу этот индекс отрезаем
            }
            if (arr.length == 0) { //когда все товары вывели
                crossSellAdd.remove(); //убрать кнопку
            }
        }

        getData('/cross-sell-dbase/dbase.json', (goods) => {
            //заполняем массив индексами
            const arr = [];
            for (let i = 0; i < goods.length; i++) {
                arr[i] = i;
            }
            //и перемешиваем массив
            arr.sort(() => Math.round(Math.random() * 100) - 50);
            //рендерим первые 4
            renderRandomGoods(goods, arr);
            //событие - добавить еще товары
            crossSellAdd.addEventListener('click', () => renderRandomGoods(goods, arr))
        });

    }

    const modal = () => {
        const cardDetailsButtonBuy = document.querySelector('.card-details__button_buy');
        const cardDetailsButtonDelivery = document.querySelector('.card-details__button_delivery');
        const modal = document.querySelector('.modal');
        const cardDetailTitle = document.querySelector('.card-details__title');
        const modalTitle = modal.querySelector('.modal__title');
        const modalSubtitle = modal.querySelector('.modal__subtitle');
        const modalTitleSubmit = modal.querySelector('.modal__title-submit');



        // открываем модалку (добавляем свойство опен)
        const openModal = event => {
            const target = event.target;
            const parent = target.closest('.cross-sell__item');
            let description;
            if (parent) {
                description = parent.querySelector('.cross-sell__title');
            } else {
                description = cardDetailTitle
            }

            modal.classList.add('open');
            document.addEventListener('keydown', escapeHandler); //добавляется событие эскейп
            modalTitle.textContent = description.textContent;
            modalTitleSubmit.value = description.textContent;
            modalSubtitle.textContent = target.dataset.buttonBuy;
        };
        //закрываем модалку (удаляем свойство опен)
        const closeModal = () => {
            modal.classList.remove('open');
            document.removeEventListener('keydown', escapeHandler); //снимается событие эскейп
        };
        //по эскейпу закрывать
        const escapeHandler = event => {
            if (event.code === "Escape") {
                closeModal();
            };
        };
        //по крестику закрывать
        modal.addEventListener('click', event => {
            const target = event.target;
            if (target.classList.contains('modal__close') || target === modal) {
                closeModal();
            }
        });



        // открываеммодалку по кнопке купить
        cardDetailsButtonBuy.addEventListener('click', openModal);
        cardDetailsButtonDelivery.addEventListener('click', openModal);

        setTimeout(() => {
            const buttonsBuy = document.querySelectorAll('.cross-sell__button');
            buttonsBuy.forEach(item => {
                item.addEventListener('click', openModal);

            });
        }, 1000);
    }




    tabs();
    accordion();

    renderCrossSell();
    modal();
    amenu('.header__menu', '.header-menu__list', '.header-menu__item', '.header-menu__burger');
});