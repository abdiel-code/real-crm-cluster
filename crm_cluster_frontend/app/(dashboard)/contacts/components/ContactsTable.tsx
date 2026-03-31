import { Contact } from "../../types";

type TableProps = {
  contacts: Array<Contact>;
};

const ContactsTable = ({ contacts }: TableProps) => {
  return (
    <table>
      {/* Headers */}
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Company</th>
          <th>Actions</th>
        </tr>
      </thead>

      {/* Rows */}
      <tbody>
        {contacts.map((contact) => (
          <tr key={contact.id}>
            <td>
              {contact.first_name} {contact.last_name}
            </td>
            <td>{contact.email}</td>
            <td>{contact.phone}</td>
            <td>{contact.account_id}</td>
            <td>{/* Edit + Delete buttons */}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ContactsTable;
