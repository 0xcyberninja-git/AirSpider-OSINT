
globalTypes = null;
globalFilter = null;

function filter(type) {
    if (type == "all") { showlist(); return; }
    if (type == "running") { showlist(["RUNNING", "STARTING", "STARTED", "INITIALIZING"], "Running"); return; }
    if (type == "finished") { showlist(["FINISHED"], "Finished"); return; }
    if (type == "failed") { showlist(["ABORTED", "FAILED"], "Failed/Aborted"); return; }
}

function stopScan(id) {
    alertify.confirm("Halt Intelligence Operation?", "Are you sure you wish to abort this operation protocol?",
    function(){ sf.stopScan(id, reload); }, function(){}).set({labels:{ok:'Abort Protocol', cancel:'Continue Operation'}});
}

function deleteScan(id) {
    alertify.confirm("Purge Repository?", "This will permanently delete the intelligence repository. Proceed?",
    function(){ sf.deleteScan(id, reload); }, function(){}).set({labels:{ok:'Purge Data', cancel:'Keep Data'}});
}

function reload() {
    $("#loader").show();
    showlist(globalTypes, globalFilter);
}

function updateStats(data) {
    var total = data.length;
    var active = 0;
    var completed = 0;
    var elements = 0;

    data.forEach(scan => {
        if (["RUNNING", "STARTED", "STARTING", "INITIALIZING"].includes(scan[6])) active++;
        if (scan[6] === "FINISHED") completed++;
        elements += parseInt(scan[7]) || 0;
    });

    $("#total-scans-val").text(total);
    $("#active-scans-val").text(active);
    $("#completed-scans-val").text(completed);
    $("#total-elements-val").text(elements.toLocaleString());
}

function showlist(types, filterName) {
    globalTypes = types;
    globalFilter = filterName;
    
    sf.fetchData(docroot + '/scanlist', null, function(data) {
        $("#loader").fadeOut(300);
        updateStats(data);
        
        if (data.length == 0) {
            $("#scancontent").html('<div class="empty-state"><h3>No Active Nodes</h3><p>Initialize your first intelligence operation.</p><a href="'+docroot+'/newscan" class="btn btn-primary">Start New Operation</a></div>');
            return;
        }

        renderCards(types, data);
    });
}

function renderCards(types, data) {
    var html = '<div class="repo-grid">';
    
    data.forEach(scan => {
        if (types != null && !types.includes(scan[6])) return;
        
        var statusClass = "status-idle";
        var statusLabelClass = "";
        if (["RUNNING", "STARTED", "STARTING", "INITIALIZING"].includes(scan[6])) {
            statusClass = "status-active pulse";
            statusLabelClass = "status-active";
        } else if (scan[6] === "FINISHED") {
            statusClass = "status-finished";
            statusLabelClass = "status-finished";
        } else if (scan[6].includes("FAILED") || scan[6].includes("ABORT")) {
            statusClass = "status-error";
            statusLabelClass = "status-error";
        }

        html += `
        <div class="repo-card">
            <div class="repo-header">
                <div>
                    <a href="${docroot}/scaninfo?id=${scan[0]}" class="repo-title">${scan[1]}</a>
                    <span class="repo-target">${scan[2]}</span>
                </div>
                <div class="status-badge ${statusLabelClass}">${scan[6]}</div>
            </div>
            
            <div class="repo-meta" style="display: flex; gap: 40px; margin-bottom: 25px;">
                <div class="meta-item">
                    <span class="meta-label">Intelligence</span>
                    <span class="meta-value" style="font-size: 20px; font-weight: 800; color: var(--primary);">${scan[7]}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Started</span>
                    <span class="meta-value" style="font-size: 13px; font-weight: 600;">${scan[3].split(' ')[0]}</span>
                </div>
            </div>

            <div class="correlation-pips" style="display: flex; gap: 8px; margin-bottom: 25px;">
                <span class="pip high" style="background:#fee2e2; color:#ef4444; padding:4px 12px; border-radius:8px; font-size:11px; font-weight:700;">${scan[8]['HIGH']}</span>
                <span class="pip medium" style="background:#fffbeb; color:#f59e0b; padding:4px 12px; border-radius:8px; font-size:11px; font-weight:700;">${scan[8]['MEDIUM']}</span>
                <span class="pip low" style="background:#eff6ff; color:#3b82f6; padding:4px 12px; border-radius:8px; font-size:11px; font-weight:700;">${scan[8]['LOW']}</span>
                <span class="pip info" style="background:#f0fdf4; color:#10b981; padding:4px 12px; border-radius:8px; font-size:11px; font-weight:700;">${scan[8]['INFO']}</span>
            </div>

            <div class="repo-actions" style="display: flex; gap: 10px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                ${(statusClass.includes("active")) ? 
                    `<button onclick="stopScan('${scan[0]}')" class="action-btn" style="background:#fee2e2; color:#ef4444; border:none; width:40px; height:40px; border-radius:12px;" title="Abort"><i class="glyphicon glyphicon-stop"></i></button>` :
                    `<button onclick="deleteScan('${scan[0]}')" class="action-btn" style="background:#fee2e2; color:#ef4444; border:none; width:40px; height:40px; border-radius:12px;" title="Purge"><i class="glyphicon glyphicon-trash"></i></button>`
                }
                <a href="${docroot}/rerunscan?id=${scan[0]}" class="action-btn" style="background:#f1f5f9; color:#64748b; width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; text-decoration:none;" title="Re-run"><i class="glyphicon glyphicon-repeat"></i></a>
                <a href="${docroot}/clonescan?id=${scan[0]}" class="action-btn" style="background:#f1f5f9; color:#64748b; width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; text-decoration:none;" title="Clone"><i class="glyphicon glyphicon-plus-sign"></i></a>
            </div>
        </div>`;
    });

    html += '</div>';
    $("#scancontent").html(html);
}

$(document).ready(function() {
    $("#btn-refresh").click(reload);
    showlist();
});
