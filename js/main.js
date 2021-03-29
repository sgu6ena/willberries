const mySlider = new Swiper('.swiper-container', {
    // параметры слайдера

    loop: true, //перелистывать слайды по кругу
    slidesPerView: 1, //количесвто видимых слайдов

    // подключение стрелок
    navigation: {
        nextEl: '.slider-button-next',
        prevEl: '.slider-button-prev',
    },
});

//cart - корзина
const buttonCart = document.querySelector('.button-cart'); //кнопка корзины
const modalCart = document.querySelector('#modal-cart'); //модалка
const viewAll = document.querySelectorAll('.view-all');
const navigationLink = document.querySelectorAll('.navigation-link:not(.view-all)');
const longGoodsList = document.querySelector('.long-goods-list');
const cartTableGoods = document.querySelector('.cart-table__goods');
const cardTableTotal = document.querySelector('.card-table__total');
const cartTotalCount = document.querySelector('.cart-count');

//goods - товары
// async await  получение товаров
const getGoods = async() => {
    const result = await fetch('db/db.json');

    if (!result.ok) {
        throw 'Ошибка: ' + result.status;
    }
    return await result.json();
}

const cart = {
    cartGoods: JSON.parse(localStorage.getItem('cartWill')) || [],
    updateLocalStorage() {
        localStorage.setItem('cartWill', JSON.stringify(this.cartGoods));
    },
    getCountCartGoods() {
        return this.cartGoods.length;
    },
    totalCount() {
        const totalCount = this.cartGoods.reduce((sum, item) => {
            return sum + item.count;
        }, 0);
        cartTotalCount.textContent = totalCount ? totalCount : '';
    },
    renderCart() {
        cartTableGoods.textContent = '';
        this.cartGoods.forEach(({ id, name, price, count }) => {
            const trGood = document.createElement('tr');
            trGood.className = 'cart-item';
            trGood.dataset.id = id;

            trGood.innerHTML = `
                <td>${name}</td>
                <td>${price}$</td>
                <td><button class="cart-btn-minus">-</button></td>
                <td>${count}</td>
                <td><button class="cart-btn-plus">+</button></td>
                <td>${price * count}$</td>
                <td><button class="cart-btn-delete">x</button></td>
            `
            cartTableGoods.append(trGood);
        });
        const totalPrice = this.cartGoods.reduce((sum, item) => {
            return sum + (item.price * item.count);
        }, 0);


        cardTableTotal.textContent = totalPrice + "$";
        this.totalCount();
        this.updateLocalStorage();

    },
    clearCart() {
        this.cartGoods.length = 0;
        this.totalCount();
        this.updateLocalStorage();
        this.renderCart();

    },
    deleteGood(id) {
        this.cartGoods = this.cartGoods.filter(item => id !== item.id)
        this.renderCart();
        this.totalCount();
        this.updateLocalStorage();
    },
    minusGood(id) {
        for (const item of this.cartGoods) {
            if (item.id === id) {
                if (item.count <= 0) {
                    this.deleteGood(id);
                } else {
                    item.count--;
                }
                break;
            }
        }
        this.renderCart();
        this.totalCount();
        this.updateLocalStorage();
    },
    plusGood(id) {
        for (const item of this.cartGoods) {
            if (item.id === id) {
                item.count++;
                break;
            }
        }
        this.renderCart();
        this.totalCount();
        this.updateLocalStorage();
    },
    addCartGoods(id) {
        const goodItem = this.cartGoods.find(item => item.id === id);
        if (goodItem) {
            this.plusGood(id);
        } else {
            getGoods()
                .then(data => data.find(item => item.id === id))
                .then(({ id, name, price }) => {
                    this.cartGoods.push({
                        id,
                        name,
                        price,
                        count: 1
                    });
                    this.totalCount();
                    this.updateLocalStorage();
                });
        }

    },
}
cart.totalCount();
//навешивание события на весь документ
document.body.addEventListener('click', event => {
    const addToCart = event.target.closest('.add-to-cart');
    if (addToCart) {
        cart.addCartGoods(addToCart.dataset.id);
    }
})

cartTableGoods.addEventListener('click', event => {
    const target = event.target;

    if (target.tagName == "BUTTON") {

        const parent = target.closest('.cart-item');
        if (target.classList.contains('cart-btn-delete')) {
            cart.deleteGood(parent.dataset.id);
        };
        if (target.classList.contains('cart-btn-plus')) {
            cart.plusGood(parent.dataset.id);
        };
        if (target.classList.contains('cart-btn-minus')) {
            cart.minusGood(parent.dataset.id);
        };
    };

})

//открытие модалки
const openModal = () => {
    cart.renderCart();
    modalCart.classList.add('show');
};
//закрытие модалки
const closeModal = () => {
    modalCart.classList.remove('show');
};

buttonCart.addEventListener('click', openModal); //событие пр нажатии на кнопку корзины - открывать модалку

modalCart.addEventListener('click', event => {
    const target = event.target;
    if (target.classList.contains('overlay') || //елси таргет оверлей 
        target.classList.contains('modal-close')) { //или крестик
        closeModal();
    }
});


//scroll smooth - плавная прокрутка
{
    const scrollLinks = document.querySelectorAll('a.scroll-link');

    for (const scrollLink of scrollLinks) {
        scrollLink.addEventListener('click', event => {
            event.preventDefault();
            const id = scrollLink.getAttribute('href');
            document.querySelector(id).scrollIntoView({
                behavior: 'smooth', //плавная
                block: 'start', //до какого момента крутить
            })
        });
    }
}



//cоздание карточки
//передача переменных происходит через ДЕСТРУКТУРИЗАЦИЮ
const createCard = ({ label, name, img, price, id, description }) => {
        const card = document.createElement('div');
        card.className = 'col-lg-3 col-sm-6';
        card.innerHTML = ` 
        <div class="goods-card">
        ${!label ? '' : ` <span class="label">${label}</span>`}

            <img src="./db/${img}" alt="${name}" class="goods-image">
            <h3 class="goods-title">${name}</h3>

            <p class="goods-description">${description}</p>
            <button class="button goods-card-btn add-to-cart" data-id="${id}">
                <span class="button-text">$${price}</span>
            </button>
        </div>
    `;

    return card;
};
//
const renderCards = data => {
    longGoodsList.textContent = '';
    const cards = data.map(createCard);
    longGoodsList.append(...cards);  //перебор с помощью спредов
    document.body.classList.add('show-goods');
};

//view all
viewAll.forEach(item => {
    item.addEventListener('click', event => {
        event.preventDefault();
        getGoods().then(renderCards);
    }  );
})

//фильтрация по параметру
const filterCards = (field, value) => {
    getGoods()
        .then(data=> data.filter( good =>  good[field] ===value ))
        .then(renderCards);
}

//фильтрация по меню
navigationLink.forEach( link =>{
    link.addEventListener('click', event => {
        event.preventDefault();
        const field = link.dataset.field;
        const value = link.textContent;
        filterCards(field, value);
    })
  
})

const modalForm = document.querySelector('.modal-form');

const postData = dataUser => fetch ('./server.php',{
    method: 'POST',
    body: dataUser,
});

const validForm = formData => {
    let valid = false;

    for (const [, value] of formData) {
        if (value.trim()){
            valid = true;
        }else {
            valid=  false;
            break;
        }
    }
    return valid;
}


modalForm.addEventListener('submit', event =>{
event.preventDefault();
const formData = new FormData(modalForm);
if (validForm(formData) && cart.getCountCartGoods()){
    formData.append('cart',JSON.stringify(cart.cartGoods) );
        
        postData(formData)
        .then(response => {
            if(!response.ok){
                throw new Error(response.status);
            }
            alert('Ваш заказ отправлен, ожидайте звонка')
        })
        .catch(err =>{
            alert('к сожалению, ваш заказ не может быть обработан, повторите заказ позже');
            console.error(err);
        })
        .finally(()=>{
            closeModal();
            modalForm.reset();
            cart.clearCart();
        })
        } else {
            if(!cart.getCountCartGoods()){
                alert('добавьте товар в корзину');
            }
            if(!validForm(formData)){
                alert('Заполните поля правильно');
            }
        }
});
