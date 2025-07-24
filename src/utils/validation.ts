export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  // US E.164 format: +1XXXXXXXXXX (11 digits total, starting with +1)
  const phoneRegex = /^\+1\d{10}$/;
  return phoneRegex.test(phoneNumber);
};

export const validateIssueTitle = (title: string): { isValid: boolean; error?: string } => {
  if (!title.trim()) {
    return { isValid: false, error: 'Issue title is required' };
  }
  if (title.length > 100) {
    return { isValid: false, error: 'Issue title must be 100 characters or less' };
  }
  return { isValid: true };
};

export const validateIssueDescription = (description: string): { isValid: boolean; error?: string } => {
  if (!description.trim()) {
    return { isValid: false, error: 'Issue description is required' };
  }
  if (description.length > 500) {
    return { isValid: false, error: 'Issue description must be 500 characters or less' };
  }
  return { isValid: true };
};

export const validateNotes = (notes: string): { isValid: boolean; error?: string } => {
  if (notes.length > 1000) {
    return { isValid: false, error: 'Notes must be 1000 characters or less' };
  }
  return { isValid: true };
};

export const validateEmailField = (email: string): { isValid: boolean; error?: string } => {
  if (!email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }
  if (!validateEmail(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  return { isValid: true };
};

export const validateStatus = (status: string): { isValid: boolean; error?: string } => {
  const validStatuses = ['Open', 'In-progress', 'Closed'];
  if (!validStatuses.includes(status)) {
    return { isValid: false, error: 'Please select a valid status' };
  }
  return { isValid: true };
};

export const validatePriority = (priority: string): { isValid: boolean; error?: string } => {
  const validPriorities = ['Critical', 'High', 'Medium', 'Low'];
  if (!validPriorities.includes(priority)) {
    return { isValid: false, error: 'Please select a valid priority' };
  }
  return { isValid: true };
};

export const validatePhoneNumberField = (phoneNumber: string): { isValid: boolean; error?: string } => {
  if (!phoneNumber.trim()) {
    return { isValid: false, error: 'Phone number is required' };
  }
  if (!validatePhoneNumber(phoneNumber)) {
    return { isValid: false, error: 'Please enter a valid US phone number in E.164 format (+1XXXXXXXXXX)' };
  }
  return { isValid: true };
}; 