import axios from 'axios';
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function submitConferenceChampions(champions) {
  return axios.post(`${API_URL}/api/vote/submit_conference_champions`, { champions }, { withCredentials: true });
}

export async function getConsensusConferenceChampions() {
  return axios.get(`${API_URL}/api/vote/consensus_conference_champions`);
}
