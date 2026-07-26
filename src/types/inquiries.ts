export interface InquiryDTO {
  replyEmail: string;
  content: string;
}

export interface InquiryResponseDTO {
  inquiryId: number;
  replyEmail: string;
  content: string;
  createdAt: string;
}
