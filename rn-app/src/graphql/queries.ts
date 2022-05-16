import {gql} from '@apollo/client';

export const FETCH_USERS = gql`
  query {
    User {
      user_id
    }
  }
`;

export const CREATE_NEW_USER = gql`
  mutation new_user($user_id: uuid!) {
    insert_User_one(object: {user_id: $user_id, covid_status: false}) {
      user_id
    }
  }
`;

export const CHECK_USER_EXIST = gql`
  query check_user_exist($user_id: uuid!) {
    User_aggregate(where: {user_id: {_eq: $user_id}}) {
      aggregate {
        count
      }
    }
  }
`;

export const CHECK_CONTACT_EXIST = gql`
  query check_contact_exist($primary_user: uuid!, $secondary_user: uuid!) {
    Contact_aggregate(
      where: {
        _or: [
          {
            primary_user: {_eq: $primary_user}
            secondary_user: {_eq: $secondary_user}
          }
          {
            primary_user: {_eq: $secondary_user}
            secondary_user: {_eq: $primary_user}
          }
        ]
      }
    ) {
      aggregate {
        count
      }
    }
  }
`;

export const CREATE_NEW_USER_WITH_DEVICE = gql`
  mutation new_user($user_id: uuid!, $device_id: String!) {
    insert_User_one(
      object: {
        user_id: $user_id
        covid_status: false
        Devices: {data: {device_id: $device_id}}
      }
    ) {
      user_id
    }
  }
`;

export const ADD_NEW_CONTACT = gql`
  mutation add_new_contact(
    $primary_user: uuid!
    $secondary_user: uuid!
    $time: timestamp!
  ) {
    insert_Contact_one(
      object: {
        primary_user: $primary_user
        secondary_user: $secondary_user
        contact_time: $time
      }
      on_conflict: {
        constraint: my_unique_idx
        update_columns: [contact_time]
        where: {contact_time: {_lt: $time}}
      }
    ) {
      contact_id
    }
  }
`;

export const UPDATE_LAST_SEEN = gql`
  mutation change_last_contact(
    $primary_user: uuid!
    $secondary_user: uuid!
    $time: timestamp!
  ) {
    update_Contact(
      where: {
        _or: [
          {
            primary_user: {_eq: $primary_user}
            secondary_user: {_eq: $secondary_user}
          }
          {
            primary_user: {_eq: $secondary_user}
            secondary_user: {_eq: $primary_user}
          }
        ]
      }
      _set: {contact_time: $time}
    ) {
      affected_rows
    }
  }
`;
