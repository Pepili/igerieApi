const KEY_FILE_LOCATION = 'path_to_your_service_account.json';
const VIEW_ID = 'YOUR_VIEW_ID';

async function getAnalyticsData() {
    const auth = new GoogleAuth({
        keyFile: KEY_FILE_LOCATION,
        scopes: 'https://www.googleapis.com/auth/analytics.readonly',
    });

    const analytics = google.analyticsreporting({
        version: 'v4',
        auth: await auth.getClient(),
    });

    const response = await analytics.reports.batchGet({
        requestBody: {
            reportRequests: [
                {
                    viewId: VIEW_ID,
                    dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
                    metrics: [
                        { expression: 'ga:sessions' },
                        { expression: 'ga:pageviews' },
                    ],
                },
            ],
        },
    });

    const data = response.data.reports[0].data.totals[0].values;
    return { sessions: data[0], pageviews: data[1] };
}

exports.getAnalytics = async (req, res) => {
    try {
        const data = await getAnalyticsData();
        res.status(200).json({ message: data });
    } catch (error) {
        res.status(500).json({ error: error.message, errorCode: 9001 });
    }
}