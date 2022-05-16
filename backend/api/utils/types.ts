export type NewContact = {
  primary_user: string;
  contact_id: string;
  secondary_user: string;
  contact_time: string;
};

export type NewCvTest = {
  user_id: string;
  test_id: string;
  test_time: string;
  test_status: boolean;
};

export type Contact_Users = {
  data: {
    Contact: [
      {
        userBySecondaryUser: {
          user_id: string;
          Devices: [
            {
              device_id: string;
            }
          ];
        };
        User: {
          user_id: string;
          Devices: [
            {
              device_id: string;
            }
          ];
        };
      }
    ];
  };
};
