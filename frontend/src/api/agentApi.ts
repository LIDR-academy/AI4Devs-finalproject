import axios from 'axios';
import { AgentConfig, AgentConfigFormData } from '../types/agentConfig';

const API_URL = import.meta.env.VITE_API_URL || '';
const AGENT_ENDPOINT = API_URL ? `${API_URL}/api/agent` : '/api/agent';

/**
 * Get the current agent configuration
 * @returns The current agent configuration
 */
export const getAgentConfig = async (): Promise<AgentConfig> => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.get(`${AGENT_ENDPOINT}/config`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to get agent configuration');
    }
    throw new Error('Failed to get agent configuration');
  }
};

/**
 * Update the agent configuration
 * @param config - The updated agent configuration
 * @returns The updated agent configuration
 */
export const updateAgentConfig = async (config: AgentConfigFormData): Promise<AgentConfig> => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.put(`${AGENT_ENDPOINT}/config`, config, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Failed to update agent configuration');
    }
    throw new Error('Failed to update agent configuration');
  }
}; 