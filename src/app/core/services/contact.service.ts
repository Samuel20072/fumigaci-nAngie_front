import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  /**
   * Cleans Colombian and international phone numbers to standard format
   */
  cleanPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10 && digits.startsWith('3')) {
      return `57${digits}`;
    }
    return digits;
  }

  /**
   * Opens direct WhatsApp chat with optional prefilled message
   */
  openWhatsApp(phone: string, customerName?: string, serviceDate?: string) {
    const cleanNumber = this.cleanPhone(phone);
    let text = `Hola${customerName ? ' ' + customerName : ''}, un cordial saludo de FumiControl.`;
    
    if (serviceDate) {
      text += ` Nos comunicamos respecto al servicio de fumigación realizado el ${serviceDate}.`;
    }

    const encodedText = encodeURIComponent(text);
    const url = `https://wa.me/${cleanNumber}?text=${encodedText}`;
    window.open(url, '_blank');
  }

  /**
   * Initiates direct phone call
   */
  callPhone(phone: string) {
    const cleanNumber = phone.replace(/\s+/g, '');
    window.location.href = `tel:${cleanNumber}`;
  }
}
