import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react'

type Language = 'en' | 'ar'
type Currency = 'USD' | 'EUR' | 'EGP'

type TranslationKey =
  | 'nav.home'
  | 'nav.products'
  | 'nav.admin'
  | 'nav.profile'
  | 'nav.orders'
  | 'nav.logout'
  | 'nav.login'
  | 'nav.register'
  | 'settings.language'
  | 'settings.currency'
  | 'products.title'
  | 'products.search'
  | 'products.category'
  | 'products.allCategories'
  | 'products.empty'
  | 'products.addToCart'
  | 'product.back'
  | 'product.reviews'
  | 'product.brand'
  | 'product.category'
  | 'product.quantity'
  | 'product.added'
  | 'product.writeReview'
  | 'cart.title'
  | 'cart.empty'
  | 'cart.continue'
  | 'cart.product'
  | 'cart.unitPrice'
  | 'cart.quantity'
  | 'cart.total'
  | 'cart.actions'
  | 'cart.edit'
  | 'cart.remove'
  | 'cart.subtotal'
  | 'cart.clear'
  | 'cart.checkout'
  | 'cart.updateQuantity'
  | 'cart.cancel'
  | 'cart.update'
  | 'checkout.title'
  | 'checkout.loginRequired'
  | 'checkout.goToLogin'
  | 'checkout.emptyCart'
  | 'checkout.shipping'
  | 'checkout.payment'
  | 'checkout.review'
  | 'checkout.street'
  | 'checkout.city'
  | 'checkout.state'
  | 'checkout.zip'
  | 'checkout.country'
  | 'checkout.cardholder'
  | 'checkout.cardNumber'
  | 'checkout.expiry'
  | 'checkout.cvv'
  | 'checkout.demoNote'
  | 'checkout.shippingAddress'
  | 'checkout.paymentMethod'
  | 'checkout.back'
  | 'checkout.next'
  | 'checkout.placeOrder'
  | 'checkout.placingOrder'
  | 'checkout.summary'
  | 'checkout.validation.shipping'
  | 'checkout.validation.stock'
  | 'checkout.validation.stockMissing'
  | 'checkout.validation.stockReserve'
  | 'checkout.error.placeOrder'

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.admin': 'Admin',
    'nav.profile': 'Profile',
    'nav.orders': 'My Orders',
    'nav.logout': 'Logout',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'settings.language': 'Language',
    'settings.currency': 'Currency',
    'products.title': 'Products',
    'products.search': 'Search products...',
    'products.category': 'Category',
    'products.allCategories': 'All Categories',
    'products.empty': 'No products found',
    'products.addToCart': 'Add to Cart',
    'product.back': 'Back to Products',
    'product.reviews': 'reviews',
    'product.brand': 'Brand',
    'product.category': 'Category',
    'product.quantity': 'Quantity',
    'product.added': 'Product added to cart successfully!',
    'product.writeReview': 'Write a Review',
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.continue': 'Continue Shopping',
    'cart.product': 'Product',
    'cart.unitPrice': 'Unit Price',
    'cart.quantity': 'Quantity',
    'cart.total': 'Total',
    'cart.actions': 'Actions',
    'cart.edit': 'Edit',
    'cart.remove': 'Remove',
    'cart.subtotal': 'Subtotal',
    'cart.clear': 'Clear Cart',
    'cart.checkout': 'Proceed to Checkout',
    'cart.updateQuantity': 'Update Quantity',
    'cart.cancel': 'Cancel',
    'cart.update': 'Update',
    'checkout.title': 'Checkout',
    'checkout.loginRequired': 'Please log in to proceed with checkout.',
    'checkout.goToLogin': 'Go to Login',
    'checkout.emptyCart': 'Your cart is empty.',
    'checkout.shipping': 'Shipping Address',
    'checkout.payment': 'Payment Method',
    'checkout.review': 'Review & Confirm',
    'checkout.street': 'Street Address',
    'checkout.city': 'City',
    'checkout.state': 'State',
    'checkout.zip': 'ZIP Code',
    'checkout.country': 'Country',
    'checkout.cardholder': 'Cardholder Name',
    'checkout.cardNumber': 'Card Number',
    'checkout.expiry': 'Expiry Date',
    'checkout.cvv': 'CVV',
    'checkout.demoNote': 'Note: This is a demo. Use test card: 4111 1111 1111 1111',
    'checkout.shippingAddress': 'Shipping Address',
    'checkout.paymentMethod': 'Payment Method',
    'checkout.back': 'Back',
    'checkout.next': 'Next',
    'checkout.placeOrder': 'Place Order',
    'checkout.placingOrder': 'Placing Order...',
    'checkout.summary': 'Order Summary',
    'checkout.validation.shipping': 'Please fill in all shipping address fields',
    'checkout.validation.stock': '{{product}} has only {{available}} item(s) available. Please reduce the quantity.',
    'checkout.validation.stockMissing': 'Stock information is unavailable for {{product}}. Please remove it or try again later.',
    'checkout.validation.stockReserve': 'Could not reserve stock for {{product}}. Please reduce the quantity or try again.',
    'checkout.error.placeOrder': 'Failed to place order',
  },
  ar: {
    'nav.home': 'الرئيسية',
    'nav.products': 'المنتجات',
    'nav.admin': 'الإدارة',
    'nav.profile': 'الملف الشخصي',
    'nav.orders': 'طلباتي',
    'nav.logout': 'تسجيل الخروج',
    'nav.login': 'تسجيل الدخول',
    'nav.register': 'إنشاء حساب',
    'settings.language': 'اللغة',
    'settings.currency': 'العملة',
    'products.title': 'المنتجات',
    'products.search': 'ابحث عن المنتجات...',
    'products.category': 'الفئة',
    'products.allCategories': 'كل الفئات',
    'products.empty': 'لا توجد منتجات',
    'products.addToCart': 'أضف إلى السلة',
    'product.back': 'العودة إلى المنتجات',
    'product.reviews': 'تقييمات',
    'product.brand': 'العلامة التجارية',
    'product.category': 'الفئة',
    'product.quantity': 'الكمية',
    'product.added': 'تمت إضافة المنتج إلى السلة بنجاح!',
    'product.writeReview': 'اكتب تقييما',
    'cart.title': 'سلة التسوق',
    'cart.empty': 'سلتك فارغة',
    'cart.continue': 'متابعة التسوق',
    'cart.product': 'المنتج',
    'cart.unitPrice': 'سعر الوحدة',
    'cart.quantity': 'الكمية',
    'cart.total': 'الإجمالي',
    'cart.actions': 'الإجراءات',
    'cart.edit': 'تعديل',
    'cart.remove': 'حذف',
    'cart.subtotal': 'المجموع الفرعي',
    'cart.clear': 'إفراغ السلة',
    'cart.checkout': 'إتمام الشراء',
    'cart.updateQuantity': 'تحديث الكمية',
    'cart.cancel': 'إلغاء',
    'cart.update': 'تحديث',
    'checkout.title': 'إتمام الشراء',
    'checkout.loginRequired': 'يرجى تسجيل الدخول لإتمام الشراء.',
    'checkout.goToLogin': 'اذهب لتسجيل الدخول',
    'checkout.emptyCart': 'سلتك فارغة.',
    'checkout.shipping': 'عنوان الشحن',
    'checkout.payment': 'طريقة الدفع',
    'checkout.review': 'المراجعة والتأكيد',
    'checkout.street': 'عنوان الشارع',
    'checkout.city': 'المدينة',
    'checkout.state': 'المحافظة',
    'checkout.zip': 'الرمز البريدي',
    'checkout.country': 'الدولة',
    'checkout.cardholder': 'اسم حامل البطاقة',
    'checkout.cardNumber': 'رقم البطاقة',
    'checkout.expiry': 'تاريخ الانتهاء',
    'checkout.cvv': 'رمز CVV',
    'checkout.demoNote': 'ملاحظة: هذه تجربة. استخدم البطاقة: 4111 1111 1111 1111',
    'checkout.shippingAddress': 'عنوان الشحن',
    'checkout.paymentMethod': 'طريقة الدفع',
    'checkout.back': 'رجوع',
    'checkout.next': 'التالي',
    'checkout.placeOrder': 'تأكيد الطلب',
    'checkout.placingOrder': 'جاري تأكيد الطلب...',
    'checkout.summary': 'ملخص الطلب',
    'checkout.validation.shipping': 'يرجى إدخال بيانات عنوان الشحن',
    'checkout.validation.stock': 'المتاح من {{product}} هو {{available}} فقط. يرجى تقليل الكمية.',
    'checkout.validation.stockMissing': 'معلومات المخزون غير متاحة للمنتج {{product}}. يرجى حذفه أو المحاولة لاحقا.',
    'checkout.validation.stockReserve': 'تعذر حجز المخزون للمنتج {{product}}. يرجى تقليل الكمية أو المحاولة مرة أخرى.',
    'checkout.error.placeOrder': 'فشل إنشاء الطلب',
  },
}

const currencyRates: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  EGP: 48,
}

const currencyLocales: Record<Currency, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  EGP: 'ar-EG',
}

interface IntlContextValue {
  language: Language
  currency: Currency
  direction: 'ltr' | 'rtl'
  setLanguage: (language: Language) => void
  setCurrency: (currency: Currency) => void
  t: (key: TranslationKey, values?: Record<string, string | number>) => string
  convertMoney: (amountInUsd: number) => number
  formatMoney: (amountInUsd: number) => string
}

const IntlContext = createContext<IntlContextValue | undefined>(undefined)

function getInitialLanguage(): Language {
  const savedLanguage = localStorage.getItem('language')
  return savedLanguage === 'ar' || savedLanguage === 'en' ? savedLanguage : 'en'
}

function getInitialCurrency(): Currency {
  const savedCurrency = localStorage.getItem('currency')
  return savedCurrency === 'USD' || savedCurrency === 'EUR' || savedCurrency === 'EGP'
    ? savedCurrency
    : 'USD'
}

export function IntlProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage)
  const [currency, setCurrencyState] = useState<Currency>(getInitialCurrency)

  const direction = language === 'ar' ? 'rtl' : 'ltr'

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = direction
  }, [direction, language])

  const value = useMemo<IntlContextValue>(
    () => ({
      language,
      currency,
      direction,
      setLanguage: (nextLanguage) => {
        localStorage.setItem('language', nextLanguage)
        setLanguageState(nextLanguage)
      },
      setCurrency: (nextCurrency) => {
        localStorage.setItem('currency', nextCurrency)
        setCurrencyState(nextCurrency)
      },
      t: (key, values) =>
        Object.entries(values || {}).reduce(
          (message, [name, value]) => message.split(`{{${name}}}`).join(String(value)),
          translations[language][key]
        ),
      convertMoney: (amountInUsd) => amountInUsd * currencyRates[currency],
      formatMoney: (amountInUsd) =>
        new Intl.NumberFormat(currencyLocales[currency], {
          style: 'currency',
          currency,
        }).format(amountInUsd * currencyRates[currency]),
    }),
    [currency, language]
  )

  return <IntlContext.Provider value={value}>{children}</IntlContext.Provider>
}

export function useIntlSettings() {
  const context = useContext(IntlContext)
  if (!context) {
    throw new Error('useIntlSettings must be used within IntlProvider')
  }
  return context
}
