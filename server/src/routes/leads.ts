import { Router } from 'express';
import { createLead, getLeads, getLeadById, updateLead, deleteLead } from '../controllers/leadsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All lead routes require authentication
router.use(authenticateToken);

router.post('/', createLead);
router.get('/', getLeads);
router.get('/:id', getLeadById);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);

export default router;