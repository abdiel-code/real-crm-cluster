import { Contact, Account } from "../../types";

type ContactModalProps = {
  accounts: Array<Account>;
};

const ContactModal = ({ accounts }: ContactModalProps) => {
  return (
    <form>
      <h1>Create Contact</h1>
      <div>
        <label htmlFor="firstNane" id="firstName">
          First Name
        </label>
        <input type="text" id="firstName" name="firstName" />
      </div>

      <div>
        <label htmlFor="lastName" id="lastName">
          Last Name
        </label>
        <input type="text" id="lastName" name="lastName" />
      </div>

      <div>
        <label htmlFor="email" id="email">
          Email
        </label>
        <input type="text" id="email" name="email" />
      </div>

      <div>
        <label htmlFor="phone" id="phone">
          Phone
        </label>
        <input type="text" id="phone" name="phone" />
      </div>

      <div>
        <label htmlFor="accountId" id="accountId">
          Account ID
        </label>
        <select name="account_id" id="account_id">
          <option value="">No Account</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </div>
    </form>
  );
};

export default ContactModal;
