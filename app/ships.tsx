export interface ShipMetadata {
  MMSI: string;
  MMSI_String: number;
  ShipName: string;
  latitude: number;
  longitude: number;
  time_utc: string;
}

export interface PositionReport {
  Cog: number;
  CommunicationState: number;
  Latitude: number;
  Longitude: number;
  MessageID: number;
  NavigationalStatus: number;
  PositionAccuracy: boolean;
  Raim: boolean;
  RateOfTurn: number;
  RepeatIndicator: number;
  Sog: number;
  Spare: number;
  SpecialManoeuvreIndicator: number;
  Timestamp: number;
  TrueHeading: number;
  UserID: number;
  Valid: boolean;
}

export interface ShipData {
  Metadata: ShipMetadata;
  PositionReport: PositionReport;
}


export interface ShipFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: number[]; // [longitude, latitude]
  };
  properties: {
    ShipName: string;
    MMSI: string;
    NavigationalStatus: number;
    cog: number;
  };
}

export interface ShipFeatureCollection {
  type: "FeatureCollection";
  features: ShipFeature[];
}
