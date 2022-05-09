import {gql} from '@apollo/client';

export const FETCH_USERS = gql`
  query {
    User {
      user_id
    }
  }
`;

export const CREATE_NEW_USER = gql`
  mutation new_user(
    $user_id: uuid!
    $device_id: String!
    $bluetooth_status: Boolean!
    $notif_status: Boolean!
  ) {
    insert_User_one(
      object: {
        user_id: $user_id
        covid_status: false
        Devices: {
          data: {
            device_id: $device_id
            bluetooth_status: $bluetooth_status
            notification_status: $notif_status
          }
        }
      }
    ) {
      user_id
    }
  }
`;
