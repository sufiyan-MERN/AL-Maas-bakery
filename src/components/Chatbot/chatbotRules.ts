export const bakeryInfo = {
  name: 'Avyan Bakehouse',
  openingTime: '9:00 AM',
  closingTime: '9:00 PM',
  menuRoute: '/menu',
  contactSection: '#contact',
}

export interface BotReply {
  text: string
  quickReplies?: string[]
}

const GREETING_PATTERN = /\b(hi|hello|hey|hii)\b/i
const MENU_PATTERN = /\b(menu|items|products|what do you sell)\b/i
const HOURS_PATTERN = /\b(timing|hours|opening|open|closed)\b/i
const ORDER_PATTERN = /\b(order|buy|purchase|place order)\b/i
const CONTACT_PATTERN = /\b(contact|phone|call|whatsapp|message)\b/i

export function getBotResponse(message: string): BotReply {
  const msg = message.toLowerCase().trim()

  if (GREETING_PATTERN.test(msg)) {
    return { text: 'Hello! 👋 Welcome to Avyan Bakehouse. How can I help you today?' }
  }

  if (MENU_PATTERN.test(msg)) {
    return {
      text: 'We offer freshly baked Cookies, Buns, Brownies, Cupcakes and Puffs. 🍪🧁',
      quickReplies: ['View Menu'],
    }
  }

  if (HOURS_PATTERN.test(msg)) {
    return { text: `We're open from ${bakeryInfo.openingTime} to ${bakeryInfo.closingTime}.` }
  }

  if (ORDER_PATTERN.test(msg)) {
    return {
      text: "Want to place an order? We'd be happy to help! 😊",
      quickReplies: ['Order Now'],
    }
  }

  if (CONTACT_PATTERN.test(msg)) {
    return {
      text: 'You can contact Avyan Bakehouse through our available contact options.',
      quickReplies: ['Contact Us'],
    }
  }

  return {
    text: "Sorry, I didn't understand that. 😊 I can help with our menu, opening hours, orders or contact information.",
    quickReplies: ['Menu', 'Opening Hours', 'Order Now', 'Contact Us'],
  }
}
