import { Resend } from 'resend';

const resend = new Resend('re_MBU3zVQb_7RvcDJjVrbV22vWsojF5GD7j');

export const sendEmail = () => {
    console.log('Sending email');
    resend.emails.send({
        'from': 'rssmith614@gmail.com',
        'to': 'rssmith614@gmail.com',
        'subject': 'Hello World',
        'html': '<h1>Hello World</h1>'
    }).then((response) => {
        console.log(response);
    }).catch((error) => {
        console.log(error);
    });
}
