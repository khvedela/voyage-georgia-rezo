export interface Experience {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
}

export interface StoryLocation {
  id: string;
  name: string;
  nameEn: string;
  coordinates: {
    longitude: number;
    latitude: number;
  };
  zoom: number;
  pitch: number;
  bearing: number;
  story: string;
  icon: string;
  color: string;
  elevation?: string;
  population?: string;
  distance?: string;
}
