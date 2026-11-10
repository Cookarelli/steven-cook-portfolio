import { purchasePolicyIntro, purchasePolicyRights, purchasePolicySections } from '@/config/purchase-policy';

export function PurchasePolicy() {
  const contact = 'optimizelocalai@gmail.com';
  return <>
    <p>{purchasePolicyIntro.split('optimizelocalai.com')[0]}<a href="https://optimizelocalai.com">optimizelocalai.com</a>{purchasePolicyIntro.split('optimizelocalai.com')[1]}</p>
    {purchasePolicySections.map(section => <section key={section.heading}><h2>{section.heading}</h2><p>{section.text.includes(contact) ? <>{section.text.split(contact)[0]}<a href={`mailto:${contact}`}><strong>{contact}</strong></a>{section.text.split(contact)[1]}</> : section.text}</p></section>)}
    <p>{purchasePolicyRights}</p>
  </>;
}
