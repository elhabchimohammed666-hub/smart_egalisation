import User from '../models/User.js';
import RequestModel from '../models/Request.js';
import CitizenProfile from '../models/CitizenProfile.js';
import Service from '../models/Service.js';
import AuditLog from '../models/AuditLog.js';

export const getDashboardStats = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date filter based on period
    const now = new Date();
    let startDate = new Date();
    if (period === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === '7d') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === '30d') {
      startDate.setDate(now.getDate() - 30);
    } else if (period === 'all') {
      startDate = new Date(0);
    }

    const dateFilter = { createdAt: { $gte: startDate } };

    // 1. Counts
    const totalCitizens = await CitizenProfile.countDocuments();
    const totalRequests = await RequestModel.countDocuments();
    const periodRequests = await RequestModel.countDocuments(dateFilter);

    // Status Breakdown
    const awaitingReview = await RequestModel.countDocuments({
      status: { $in: ['Submitted', 'Under Review'] }
    });

    const actionRequired = await RequestModel.countDocuments({
      status: 'Action Required'
    });

    const approved = await RequestModel.countDocuments({
      status: 'Approved'
    });

    const readyForCollection = await RequestModel.countDocuments({
      status: 'Ready for Collection'
    });

    const issued = await RequestModel.countDocuments({
      status: 'Issued'
    });

    const rejected = await RequestModel.countDocuments({
      status: 'Rejected'
    });

    const draftCount = await RequestModel.countDocuments({
      status: 'Draft'
    });

    // 2. Average Processing Time Calculation (from submissionDate to completionDate on Issued requests)
    const completedRequests = await RequestModel.find({
      status: 'Issued',
      submissionDate: { $exists: true, $ne: null },
      completionDate: { $exists: true, $ne: null }
    }).select('submissionDate completionDate');

    let totalDurationMs = 0;
    completedRequests.forEach(req => {
      const start = new Date(req.submissionDate).getTime();
      const end = new Date(req.completionDate).getTime();
      if (end >= start) {
        totalDurationMs += (end - start);
      }
    });

    const avgProcessingHours = completedRequests.length > 0
      ? Math.round((totalDurationMs / completedRequests.length) / (1000 * 60 * 60) * 10) / 10
      : 0;

    // 3. Distribution by Service
    const services = await Service.find().select('name code');
    const serviceDistribution = await Promise.all(
      services.map(async (svc) => {
        const count = await RequestModel.countDocuments({ service: svc._id });
        return {
          serviceId: svc._id,
          name: svc.name,
          code: svc.code,
          count
        };
      })
    );

    // 4. Volume Over Time (grouped by last 7 days)
    const volumeTimeline = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const dayCount = await RequestModel.countDocuments({
        createdAt: { $gte: dayStart, $lte: dayEnd }
      });

      const dayName = dayStart.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
      volumeTimeline.push({ date: dayName, count: dayCount });
    }

    // 5. Recent Administrative Activity Feed
    const recentActivity = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalCitizens,
          totalRequests,
          periodRequests,
          awaitingReview,
          actionRequired,
          approved,
          readyForCollection,
          issued,
          rejected,
          draftCount,
          avgProcessingHours
        },
        serviceDistribution,
        volumeTimeline,
        recentActivity
      }
    });
  } catch (error) {
    console.error('[DashboardController] Error fetching stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul des statistiques administratives.',
      error: error.message
    });
  }
};
