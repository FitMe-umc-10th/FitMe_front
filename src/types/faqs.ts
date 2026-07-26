interface faq {
  faqId: number;
  question: string;
  answer: string;
}

export interface faqsDTO {
  faqs: faq[];
}
