export interface AnnouncementDTO {
  announcementId: number;
  category: string;
  categoryName: string;
  title: string;
  createdAt: string;
  createdAtString: string;
  isNew: boolean;
}

export interface AnnouncementDetailDTO {
  announcementId: number;
  title: string;
  content: string;
  createdAt: string;
}
