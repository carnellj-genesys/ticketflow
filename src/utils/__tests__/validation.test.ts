import { describe, it, expect } from 'vitest';
import {
  validateEmailField,
  validatePhoneNumberField,
  validateIssueTitle,
  validateIssueDescription,
  validateStatus,
  validatePriority
} from '../validation';

describe('Validation Utils', () => {
  describe('validateEmailField', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmailField('test@example.com')).toEqual({ isValid: true });
      expect(validateEmailField('user.name@domain.co.uk')).toEqual({ isValid: true });
      expect(validateEmailField('test+tag@example.org')).toEqual({ isValid: true });
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmailField('invalid-email')).toEqual({ 
        isValid: false, 
        error: 'Please enter a valid email address' 
      });
      expect(validateEmailField('test@')).toEqual({ 
        isValid: false, 
        error: 'Please enter a valid email address' 
      });
      expect(validateEmailField('@example.com')).toEqual({ 
        isValid: false, 
        error: 'Please enter a valid email address' 
      });
      expect(validateEmailField('')).toEqual({ 
        isValid: false, 
        error: 'Email is required' 
      });
    });
  });

  describe('validatePhoneNumberField', () => {
    it('should validate correct US E.164 phone numbers', () => {
      expect(validatePhoneNumberField('+15551234567')).toEqual({ isValid: true });
      expect(validatePhoneNumberField('+15559876543')).toEqual({ isValid: true });
      expect(validatePhoneNumberField('+15551234567')).toEqual({ isValid: true });
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhoneNumberField('')).toEqual({ 
        isValid: false, 
        error: 'Phone number is required' 
      });
      expect(validatePhoneNumberField('5551234567')).toEqual({ 
        isValid: false, 
        error: 'Please enter a valid US phone number in E.164 format (+1XXXXXXXXXX)' 
      });
      expect(validatePhoneNumberField('+1555123456')).toEqual({ 
        isValid: false, 
        error: 'Please enter a valid US phone number in E.164 format (+1XXXXXXXXXX)' 
      });
      expect(validatePhoneNumberField('+25551234567')).toEqual({ 
        isValid: false, 
        error: 'Please enter a valid US phone number in E.164 format (+1XXXXXXXXXX)' 
      });
      expect(validatePhoneNumberField('invalid')).toEqual({ 
        isValid: false, 
        error: 'Please enter a valid US phone number in E.164 format (+1XXXXXXXXXX)' 
      });
    });
  });

  describe('validateIssueTitle', () => {
    it('should validate correct titles', () => {
      expect(validateIssueTitle('Valid title')).toEqual({ isValid: true });
      expect(validateIssueTitle('A'.repeat(100))).toEqual({ isValid: true });
    });

    it('should reject invalid titles', () => {
      expect(validateIssueTitle('')).toEqual({ 
        isValid: false, 
        error: 'Issue title is required' 
      });
      expect(validateIssueTitle('A'.repeat(101))).toEqual({ 
        isValid: false, 
        error: 'Issue title must be 100 characters or less' 
      });
    });
  });

  describe('validateIssueDescription', () => {
    it('should validate correct descriptions', () => {
      expect(validateIssueDescription('Valid description')).toEqual({ isValid: true });
      expect(validateIssueDescription('A'.repeat(500))).toEqual({ isValid: true });
    });

    it('should reject invalid descriptions', () => {
      expect(validateIssueDescription('')).toEqual({ 
        isValid: false, 
        error: 'Issue description is required' 
      });
      expect(validateIssueDescription('A'.repeat(501))).toEqual({ 
        isValid: false, 
        error: 'Issue description must be 500 characters or less' 
      });
    });
  });

  describe('validateStatus', () => {
    it('should validate correct statuses', () => {
      expect(validateStatus('Open')).toEqual({ isValid: true });
      expect(validateStatus('In-progress')).toEqual({ isValid: true });
      expect(validateStatus('Closed')).toEqual({ isValid: true });
    });

    it('should reject invalid statuses', () => {
      expect(validateStatus('Invalid')).toEqual({ 
        isValid: false, 
        error: 'Please select a valid status' 
      });
      expect(validateStatus('')).toEqual({ 
        isValid: false, 
        error: 'Please select a valid status' 
      });
    });
  });

  describe('validatePriority', () => {
    it('should validate correct priorities', () => {
      expect(validatePriority('Critical')).toEqual({ isValid: true });
      expect(validatePriority('High')).toEqual({ isValid: true });
      expect(validatePriority('Medium')).toEqual({ isValid: true });
      expect(validatePriority('Low')).toEqual({ isValid: true });
    });

    it('should reject invalid priorities', () => {
      expect(validatePriority('Invalid')).toEqual({ 
        isValid: false, 
        error: 'Please select a valid priority' 
      });
      expect(validatePriority('')).toEqual({ 
        isValid: false, 
        error: 'Please select a valid priority' 
      });
    });
  });
}); 