
var refreshInterval = 5000;
var statusTimer = null;

function purgeOperation() {
    alertify.confirm("Purge Repository?", "This will permanently delete the intelligence repository. Proceed?",
    function(){ sf.deleteScan(scanId, function() { window.location.href = docroot + '/scans'; }); }, function(){}).set({labels:{ok:'Purge Data', cancel:'Keep Data'}});
}

function updateStatus() {
    sf.fetchData(docroot + '/scanstatus?id=' + scanId, null, function(data) {
        if (!data) return;
        
        var status = data[0][5];
        var badge = $("#scan-status-badge");
        badge.text(status);
        badge.attr('class', 'status-badge'); // Reset
        
        if (["RUNNING", "STARTED", "STARTING", "INITIALIZING"].includes(status)) {
            badge.addClass("status-active pulse");
        } else if (status === "FINISHED") {
            badge.addClass("status-finished");
            clearInterval(statusTimer);
        } else {
            badge.addClass("status-error");
            clearInterval(statusTimer);
        }
    });
}

function updateSummary() {
    sf.fetchData(docroot + '/scansummary?id=' + scanId + '&by=type', null, function(data) {
        if (!data) return;
        
        var html = '<div class="summary-list">';
        data.forEach(item => {
            html += `
            <div class="summary-item card" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding:18px !important; border-radius:12px;">
                <div>
                   <span class="type-label" style="font-weight:700; display:block; font-size:15px; color:var(--text-main);">${item[1]}</span>
                   <span style="font-size:11px; color:var(--text-muted); text-transform:uppercase; font-weight:700;">${item[0]}</span>
                </div>
                <span class="type-count" style="background:var(--primary); color:#fff; font-size:16px; font-weight:800; padding:8px 16px; border-radius:10px;">${item[4]}</span>
            </div>`;
        });
        html += '</div>';
        $("#summary-data").html(html);
    });
}

function browseIntelligence() {
    $("#browse-data").html('<div style="text-align:center; padding:50px;"><p>Fetching Intelligence Nodes...</p></div>');
    
    sf.fetchData(docroot + '/scansummary?id=' + scanId + '&by=type', null, function(data) {
        if (!data || data.length == 0) {
            $("#browse-data").html('<div style="text-align:center; padding:50px;"><p>No detailed intelligence nodes detected yet.</p></div>');
            return;
        }
        
        var html = '<div class="intelligence-explorer">';
        data.forEach(item => {
            var typeCode = item[0];
            var typeName = item[1];
            var count = item[4];
            var safeId = typeCode.replace(/ /g, '_').replace(/:/g, '_');
            
            html += `
            <div class="intel-category card" style="padding:0 !important; overflow:hidden; margin-bottom:20px;">
                <div class="category-header" style="background:#f8fafc; padding:20px 30px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="$('#results-${safeId}').parent().slideToggle()">
                    <div style="display:flex; align-items:center; gap:15px;">
                        <i class="glyphicon glyphicon-folder-open" style="color:var(--primary);"></i>
                        <h4 style="margin:0; font-weight:800; font-size:16px;">${typeName}</h4>
                    </div>
                    <span class="badge" style="background:#e2e8f0; color:#475569; font-weight:800;">${count} Items</span>
                </div>
                <div class="category-details" style="display:none; padding:20px 30px; background:#fff;">
                    <div id="results-${safeId}" class="intel-results">Loading results...</div>
                </div>
            </div>`;
            
            // Delayed fetch for results to prevent UI lockup
            setTimeout(function() {
                sf.fetchData(docroot + '/scaneventresultsunique?id=' + scanId + '&eventType=' + encodeURIComponent(typeCode), null, function(results) {
                    var resHtml = '<ul style="list-style:none; padding:0; margin:0;">';
                    results.forEach(res => {
                        resHtml += `
                        <li style="padding:15px 0; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-family:\'JetBrains Mono\'; font-size:14px; color:var(--text-main);">${sf.replace_sfurltag(res[0])}</span>
                            <div style="display:flex; gap:10px;">
                                <span class="badge" style="background:#f1f5f9; color:#64748b; font-size:11px; font-weight:700;">Instance Count: ${res[2]}</span>
                            </div>
                        </li>`;
                    });
                    resHtml += '</ul>';
                    $(`#results-${safeId}`).html(resHtml);
                });
            }, 100);
        });
        html += '</div>';
        $("#browse-data").html(html);
    });
}

function renderGraph() {
    $("#graph-canvas").html('<div style="text-align:center; padding:100px;"><p>Synthesizing Intelligence Graph...</p></div>');
    sf.fetchData(docroot + '/scanviz?id=' + scanId, null, function(data) {
        if (!data || !data.tree) {
             $("#graph-canvas").html('<div style="text-align:center; padding:100px;"><p>No graph data available for this operation.</p></div>');
             return;
        }
        $("#graph-canvas").empty();
        sf_viz_dendrogram("#graph-canvas", data);
    });
}

function updateLogs() {
    sf.fetchData(docroot + '/scanlog?id=' + scanId + '&limit=100', null, function(data) {
        if (!data) return;
        
        var html = '<div class="log-container" style="font-family:\'JetBrains Mono\', monospace; font-size:12px; line-height:1.6; padding:10px;">';
        data.forEach(log => {
            var typeClass = "text-muted";
            if (log[2] === "ERROR") typeClass = "text-danger";
            if (log[2] === "WARNING") typeClass = "text-warning";

            html += `
            <div class="log-entry" style="margin-bottom:6px; display:flex; gap:15px; border-bottom:1px solid #f1f5f9; padding-bottom:4px;">
                <span style="color:#94a3b8; font-size:10px; min-width:140px;">${log[0]}</span>
                <span style="color:var(--primary); font-weight:800; min-width:120px;">[${log[1]}]</span>
                <span class="${typeClass}">${log[3]}</span>
            </div>`;
        });
        html += '</div>';
        $("#log-data").html(html);
    });
}

$(document).ready(function() {
    updateStatus();
    updateSummary();
    if (statusTimer) clearInterval(statusTimer);
    statusTimer = setInterval(updateStatus, refreshInterval);
    
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var target = $(e.target).attr("href");
        if (target === "#tab-summary") updateSummary();
        if (target === "#tab-browse") browseIntelligence();
        if (target === "#tab-graph") renderGraph();
        if (target === "#tab-log") updateLogs();
    });
});
