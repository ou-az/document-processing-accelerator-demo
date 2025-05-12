import { OpenAI } from 'openai';
import { DocumentExtractionResult, DocumentType } from '../models/Document';

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: openaiApiKey
});

/**
 * Extract information from document text using OpenAI
 */
export const extractDocumentInfo = async (
  text: string,
  documentType: DocumentType = DocumentType.OTHER
): Promise<DocumentExtractionResult> => {
  try {
    const promptByType: Record<DocumentType, string> = {
      [DocumentType.INVOICE]: 'Extract all key details from this invoice including invoice number, date, total amount, vendor information, line items, and payment terms. Format as JSON.',
      [DocumentType.RECEIPT]: 'Extract all key details from this receipt including date, merchant name, items purchased, prices, totals, payment method, and taxes. Format as JSON.',
      [DocumentType.CONTRACT]: 'Extract key contract information including parties involved, effective date, termination date, key clauses, and obligations. Format as JSON.',
      [DocumentType.FORM]: 'Extract all form fields and values from this document. Format as JSON.',
      [DocumentType.ID]: 'Extract identification information such as name, date of birth, ID number, address, and expiry date if applicable. Format as JSON.',
      [DocumentType.OTHER]: 'Extract all key information, entities, and important content from this document. Format as JSON.'
    };

    const prompt = promptByType[documentType];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant specialized in document information extraction. Extract key information from documents into structured data format.'
        },
        {
          role: 'user',
          content: `${prompt}\n\nDocument text:\n${text}`
        }
      ],
      temperature: 0.2,
      max_tokens: 1500
    });

    // Try to parse the response as JSON
    try {
      const content = response.choices[0]?.message?.content || '{}';
      const parsedContent = JSON.parse(content);
      
      const result: DocumentExtractionResult = {
        fields: parsedContent,
        keyValuePairs: extractKeyValuePairs(parsedContent),
        summary: await generateSummary(text),
        rawText: text.substring(0, 1000) // Store first 1000 chars of raw text
      };
      
      return result;
    } catch (error) {
      // If JSON parsing fails, use the raw text response
      console.error('Failed to parse OpenAI response as JSON:', error);
      
      return {
        rawText: text.substring(0, 1000),
        summary: await generateSummary(text),
        keyValuePairs: {}
      };
    }
  } catch (error) {
    console.error('Error extracting document info with OpenAI:', error);
    throw new Error('Failed to extract document information');
  }
};

/**
 * Generate a summary of the document
 */
const generateSummary = async (text: string): Promise<string> => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Provide a brief summary of the document in 1-2 sentences.'
        },
        {
          role: 'user',
          content: text.substring(0, 4000) // Use first 4000 chars for summary
        }
      ],
      temperature: 0.3,
      max_tokens: 150
    });

    return response.choices[0]?.message?.content || 'No summary available';
  } catch (error) {
    console.error('Error generating document summary:', error);
    return 'Error generating summary';
  }
};

/**
 * Extract key-value pairs from the parsed object
 */
const extractKeyValuePairs = (obj: any, prefix = ''): Record<string, string> => {
  const result: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null) {
      const nested = extractKeyValuePairs(value, newKey);
      Object.assign(result, nested);
    } else if (value !== null && value !== undefined) {
      result[newKey] = String(value);
    }
  }
  
  return result;
};
