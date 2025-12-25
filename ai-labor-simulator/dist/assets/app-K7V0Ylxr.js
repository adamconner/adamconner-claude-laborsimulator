const L=e=>{if(e==null)return"";const t=document.createElement("div");return t.textContent=String(e),t.innerHTML};let _,H,h,v,E,p=null,A=null,U=!1;const z={scenarioName:"My Scenario",targetYear:"2029",targetUR:10,aiAdoption:70,automationPace:"moderate",adoptionCurve:"s_curve"},W="ai_labor_simulator_saved_simulations";async function me(){try{_=new EconomicDataService,H=new EconomicIndicators,v=new InterventionSystem,E=new VisualizationManager,E.initDefaults(),await _.loadBaselineData(),h=new SimulationEngine(_,H),await h.initialize(),je(),He(),Ue(),Ne(),Oe(),We(),V(),be(),B(),te(),xe(),await zt(),we(),await Vt(),console.log("AI Labor Market Simulator initialized")}catch(e){console.error("Initialization error:",e),alert("Failed to initialize simulator. Please refresh the page.")}}function je(){document.getElementById("targetUR").addEventListener("input",function(){document.getElementById("urValue").textContent=this.value}),document.getElementById("aiAdoption").addEventListener("input",function(){document.getElementById("aiValue").textContent=this.value})}function pe(e){document.querySelectorAll(".section").forEach(t=>t.classList.remove("active")),document.getElementById(`${e}-section`).classList.add("active"),document.querySelectorAll(".nav-tab").forEach(t=>t.classList.remove("active")),event.target.classList.add("active")}async function He(){const e=await _.getCurrentSnapshot();document.getElementById("stat-ur").textContent=e.labor_market.unemployment_rate.toFixed(1)+"%",document.getElementById("stat-emp").textContent=(e.labor_market.total_employment/1e6).toFixed(1)+"M",document.getElementById("stat-lfpr").textContent=e.labor_market.labor_force_participation.toFixed(1)+"%",document.getElementById("stat-jo").textContent=(e.labor_market.job_openings/1e6).toFixed(1)+"M"}async function Ue(){const e=await _.getSectorData(),t=document.getElementById("sectorTableBody"),n=H.calculateSectorExposure(e),a=H.calculateJobsAtRisk(e);let o="";for(const[l,i]of Object.entries(n)){const s=i.risk_level==="high"?"tag-high":i.risk_level.includes("medium")?"tag-medium":"tag-low";o+=`
            <tr>
                <td><strong>${i.name}</strong></td>
                <td>${(i.employment/1e6).toFixed(1)}M</td>
                <td>
                    <div class="progress-bar" style="width: 100px; display: inline-block; vertical-align: middle;">
                        <div class="fill" style="width: ${i.exposure*100}%; background: ${i.risk_level==="high"?"var(--danger)":i.risk_level.includes("medium")?"var(--warning)":"var(--secondary)"}"></div>
                    </div>
                    <span style="margin-left: 8px;">${(i.exposure*100).toFixed(0)}%</span>
                </td>
                <td><span class="tag ${s}">${i.risk_level.replace("-"," ")}</span></td>
                <td>${(i.at_risk_jobs/1e6).toFixed(1)}M</td>
            </tr>
        `}t.innerHTML=o;const r=document.getElementById("riskSummary");r.innerHTML=`
        <div class="indicator-item">
            <div>
                <div class="indicator-name">Total Employment</div>
            </div>
            <div class="indicator-value">${(a.total_employment/1e6).toFixed(1)}M</div>
        </div>
        <div class="indicator-item">
            <div>
                <div class="indicator-name">Total Jobs at Risk</div>
            </div>
            <div class="indicator-value" style="color: var(--danger);">${(a.total_at_risk/1e6).toFixed(1)}M</div>
        </div>
        <div class="indicator-item">
            <div>
                <div class="indicator-name">Percentage at Risk</div>
            </div>
            <div class="indicator-value">${a.percentage_at_risk}%</div>
        </div>
        <div class="indicator-item">
            <div>
                <div class="indicator-name">High Risk Employment</div>
            </div>
            <div class="indicator-value">${(a.by_risk_level.high/1e6).toFixed(1)}M</div>
        </div>
    `,Ve(a)}function Ne(){const e=v.getAvailableTypes(),t=document.getElementById("interventionTypes");let n="";for(const a of e)n+=`
            <div class="card" style="cursor: pointer;" onclick="quickAddIntervention('${a.type}')">
                <h4 style="margin-bottom: 8px;">${a.name}</h4>
                <p style="font-size: 0.875rem; color: var(--gray-500); margin-bottom: 12px;">
                    ${a.description}
                </p>
                <span class="tag tag-medium">${a.category.replace("_"," ")}</span>
            </div>
        `;t.innerHTML=n}async function Oe(){const e=await _.getHistoricalTrends(),t=document.getElementById("historicalChart");new Chart(t,{type:"line",data:{labels:e.unemployment_rate.map(n=>n.year),datasets:[{label:"Unemployment Rate (%)",data:e.unemployment_rate.map(n=>n.value),borderColor:"#3b82f6",backgroundColor:"rgba(59, 130, 246, 0.1)",fill:!0,tension:.4}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}},scales:{y:{beginAtZero:!0,max:12}}}})}async function We(){const e=await _.getSectorData();E.createSectorEmploymentChart("sectorEmploymentChart",e)}function Ve(e){const t=document.getElementById("riskLevelChart");new Chart(t,{type:"doughnut",data:{labels:["High Risk","Medium-High","Medium","Low Risk"],datasets:[{data:[e.by_risk_level.high/1e6,e.by_risk_level["medium-high"]/1e6,e.by_risk_level.medium/1e6,e.by_risk_level.low/1e6],backgroundColor:["#ef4444","#f59e0b","#3b82f6","#10b981"]}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"bottom"}}}})}function Ye(e){const n={moderate:{targetUR:8,aiAdoption:55,automationPace:"moderate",adoptionCurve:"s_curve",targetYear:2029},rapid:{targetUR:12,aiAdoption:80,automationPace:"fast",adoptionCurve:"exponential",targetYear:2027},managed:{targetUR:6,aiAdoption:60,automationPace:"moderate",adoptionCurve:"s_curve",targetYear:2029,interventions:["job_retraining","transition_assistance"]}}[e];if(n){if(document.getElementById("targetUR").value=n.targetUR,document.getElementById("urValue").textContent=n.targetUR,document.getElementById("aiAdoption").value=n.aiAdoption,document.getElementById("aiValue").textContent=n.aiAdoption,document.getElementById("automationPace").value=n.automationPace,document.getElementById("adoptionCurve").value=n.adoptionCurve,document.getElementById("targetYear").value=n.targetYear,document.getElementById("scenarioName").value=e.charAt(0).toUpperCase()+e.slice(1)+" Disruption Scenario",v.interventions=[],n.interventions)for(const a of n.interventions)v.addIntervention(a);M()}}function Je(){var t,n,a,o,r,l;const e=new Date().getFullYear();return{name:((t=document.getElementById("scenarioName"))==null?void 0:t.value)||"My Scenario",timeframe:{start_year:e,end_year:parseInt(((n=document.getElementById("targetYear"))==null?void 0:n.value)||"2029")},targets:{unemployment_rate:parseFloat(((a=document.getElementById("targetUR"))==null?void 0:a.value)||"10"),ai_adoption_rate:parseInt(((o=document.getElementById("aiAdoption"))==null?void 0:o.value)||"70"),automation_pace:((r=document.getElementById("automationPace"))==null?void 0:r.value)||"moderate"},ai_parameters:{adoption_curve:((l=document.getElementById("adoptionCurve"))==null?void 0:l.value)||"s_curve"},interventions:typeof v<"u"?v.interventions.filter(i=>i.active):[]}}async function Ge(){U=!1;const e={name:document.getElementById("scenarioName").value,end_year:parseInt(document.getElementById("targetYear").value),target_unemployment:parseFloat(document.getElementById("targetUR").value),ai_adoption_rate:parseInt(document.getElementById("aiAdoption").value),automation_pace:document.getElementById("automationPace").value,adoption_curve:document.getElementById("adoptionCurve").value},t=document.getElementById("simulation-results");t.textContent="";const n=DOMUtils.createCard({content:DOMUtils.createLoadingSpinner("Running simulation..."),style:{textAlign:"center",padding:"60px"}});t.appendChild(n),document.querySelectorAll(".section").forEach(a=>a.classList.remove("active")),document.getElementById("simulation-section").classList.add("active"),document.querySelectorAll(".nav-tab").forEach(a=>a.classList.remove("active")),document.querySelectorAll(".nav-tab")[3].classList.add("active");try{const a=h.createScenario(e);a.interventions=v.interventions.filter(r=>r.active);const o=await h.runSimulation();p=o,D(o),typeof simulationHistory<"u"&&simulationHistory.save(o),ae(),Ke(e)}catch(a){console.error("Simulation error:",a),t.textContent="",t.appendChild(DOMUtils.createErrorMessage(a.message))}}let I=null;function qe(){const e=document.getElementById("enableTargetOptimizer").checked,t=document.getElementById("targetOptimizerControls"),n=document.getElementById("optimizerActions");if(t.style.display=e?"block":"none",n.style.display=e?"block":"none",e&&I!==null){const a=Math.max(2,I-2);document.getElementById("targetUnemploymentRate").value=a,document.getElementById("targetURValue").textContent=a.toFixed(1)}}async function Ke(e){try{const t=[...v.interventions];v.interventions=[];const n=h.createScenario({...e,interventions:[]});I=(await h.runSimulation()).summary.final_unemployment_rate,v.interventions=t;const o=document.getElementById("baselineUnemploymentDisplay");o&&(o.innerHTML=`${I.toFixed(1)}%`,o.style.color=I>8?"var(--danger)":I>6?"var(--warning)":"var(--secondary)",o.nextElementSibling.textContent=`By ${e.end_year}`),h.createScenario(e),h.scenario.interventions=t.filter(r=>r.active)}catch(t){console.error("Error calculating baseline:",t)}}async function Ze(){if(I===null){b("Run a simulation first to calculate baseline unemployment.","warning");return}const e=parseFloat(document.getElementById("targetUnemploymentRate").value),t=document.getElementById("optimizeBtn"),n=document.getElementById("optimizationResults"),a=document.getElementById("optimizationContent");if(e>=I){b("Target must be lower than baseline unemployment rate.","warning");return}t.disabled=!0,t.innerHTML='<span class="spinner" style="width: 14px; height: 14px; margin-right: 6px;"></span> Analyzing...';try{const o=I-e,r=await Xe(o,e);n.style.display="block",a.innerHTML=Qe(r,e)}catch(o){console.error("Optimization error:",o),b("Optimization failed: "+o.message,"error")}finally{t.disabled=!1,t.innerHTML='<span style="margin-right: 6px;">&#9881;</span> Find Intervention Mix'}}async function Xe(e,t){const a=Object.entries({job_retraining:{name:"Job Retraining Programs",ur_reduction_per_billion:.15,min_budget:10,max_budget:100,default_params:{annual_budget:50,success_rate:70},cost_per_point:6.67,implementation_time:"Medium-term (1-2 years)"},ubi:{name:"Universal Basic Income",ur_reduction_per_billion:.08,min_budget:500,max_budget:3e3,default_params:{monthly_amount:1e3,eligibility_threshold:5e4},cost_per_point:12.5,implementation_time:"Immediate"},public_works:{name:"Public Works Programs",ur_reduction_per_billion:.25,min_budget:20,max_budget:200,default_params:{annual_budget:75,job_creation_rate:15e3},cost_per_point:4,implementation_time:"Short-term (6-12 months)"},tax_incentives:{name:"Tax Incentives for Hiring",ur_reduction_per_billion:.12,min_budget:10,max_budget:100,default_params:{credit_per_employee:5e3,eligibility:"all"},cost_per_point:8.33,implementation_time:"Short-term (3-6 months)"},education_investment:{name:"Education Investment",ur_reduction_per_billion:.1,min_budget:20,max_budget:150,default_params:{annual_budget:50,focus_area:"stem"},cost_per_point:10,implementation_time:"Long-term (3-5 years)"},transition_assistance:{name:"Transition Assistance",ur_reduction_per_billion:.18,min_budget:5,max_budget:50,default_params:{stipend_months:12,monthly_amount:2e3},cost_per_point:5.56,implementation_time:"Immediate"},reduced_work_week:{name:"Reduced Work Week",ur_reduction_per_billion:.2,min_budget:30,max_budget:200,default_params:{hours_per_week:32,wage_adjustment:0},cost_per_point:5,implementation_time:"Medium-term (1-2 years)"},early_retirement:{name:"Early Retirement Incentives",ur_reduction_per_billion:.14,min_budget:20,max_budget:100,default_params:{eligible_age:60,benefit_percentage:80},cost_per_point:7.14,implementation_time:"Short-term (6-12 months)"},entrepreneurship:{name:"Entrepreneurship Support",ur_reduction_per_billion:.22,min_budget:5,max_budget:50,default_params:{grant_amount:25e3,loan_rate:2},cost_per_point:4.55,implementation_time:"Medium-term (1-2 years)"}}).sort((m,u)=>m[1].cost_per_point-u[1].cost_per_point),o=[];let r=e,l=0,i=0;const s=parseInt(document.getElementById("targetYear").value)-new Date().getFullYear();for(const[m,u]of a){if(r<=0)break;const g=r/u.ur_reduction_per_billion,f=Math.min(Math.max(g,u.min_budget),u.max_budget),$=f*u.ur_reduction_per_billion;$>.05&&(o.push({type:m,name:u.name,budget:f,ur_reduction:$,cost_per_point:u.cost_per_point,implementation_time:u.implementation_time,params:{...u.default_params,annual_budget:f}}),r-=$,l+=f)}i=l*s;const c=e-Math.max(0,r),d=I-c;return{targetRate:t,baselineRate:I,achievableRate:d,reductionNeeded:e,achievableReduction:c,gap:Math.max(0,r),recommendations:o,totalAnnualCost:l,totalMultiYearCost:i,simulationYears:s,feasible:r<=.1}}function Qe(e,t){const n=l=>l>=1e3?"$"+(l/1e3).toFixed(1)+"T":"$"+l.toFixed(0)+"B",a=e.feasible?"var(--secondary)":"var(--warning)",o=e.feasible?"Achievable":"Partially Achievable";let r=`
        <div style="background: var(--gray-800); border-radius: 6px; padding: 10px; margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.75rem; color: var(--gray-400);">Target</span>
                <span style="font-weight: 600; color: var(--primary);">${t.toFixed(1)}%</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                <span style="font-size: 0.75rem; color: var(--gray-400);">Achievable</span>
                <span style="font-weight: 600; color: ${a};">${e.achievableRate.toFixed(1)}%</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                <span style="font-size: 0.75rem; color: var(--gray-400);">Status</span>
                <span style="font-size: 0.75rem; color: ${a};">${o}</span>
            </div>
        </div>

        <div style="font-size: 0.7rem; color: var(--gray-400); margin-bottom: 6px;">RECOMMENDED INTERVENTIONS</div>
    `;for(const l of e.recommendations)r+=`
            <div style="background: var(--gray-800); border-radius: 6px; padding: 8px; margin-bottom: 6px; font-size: 0.8rem;">
                <div style="font-weight: 500; color: var(--text-primary); margin-bottom: 2px;">${l.name}</div>
                <div style="display: flex; justify-content: space-between; color: var(--gray-400);">
                    <span>${n(l.budget)}/yr</span>
                    <span style="color: var(--secondary);">-${l.ur_reduction.toFixed(2)}%</span>
                </div>
            </div>
        `;return r+=`
        <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2)); border-radius: 6px; padding: 10px; margin-top: 10px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 0.75rem; color: var(--gray-300);">Annual Cost</span>
                <span style="font-weight: 600; color: var(--primary);">${n(e.totalAnnualCost)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span style="font-size: 0.75rem; color: var(--gray-300);">${e.simulationYears}-Year Total</span>
                <span style="font-weight: 600; color: var(--warning);">${n(e.totalMultiYearCost)}</span>
            </div>
        </div>

        <button class="btn btn-primary btn-block btn-sm" onclick="applyOptimizedInterventions()" style="margin-top: 10px;">
            Apply These Interventions
        </button>
    `,window.lastOptimization=e,r}function et(){if(!window.lastOptimization){b("No optimization results to apply.","warning");return}v.interventions=[];for(const e of window.lastOptimization.recommendations)v.addIntervention(e.type,e.params);M(),b(`Applied ${window.lastOptimization.recommendations.length} interventions. Run simulation to see results.`,"success"),document.getElementById("enableTargetOptimizer").checked=!1,document.getElementById("targetOptimizerControls").style.display="none",document.getElementById("optimizerActions").style.display="none"}function tt(e,t){var c;if(!e||t.length===0)return'<p style="color: var(--gray-500);">No intervention data available.</p>';const n=d=>d==null||isNaN(d)?"0":Math.abs(d)>=1e12?(d/1e12).toFixed(1)+"T":Math.abs(d)>=1e9?(d/1e9).toFixed(1)+"B":Math.abs(d)>=1e6?(d/1e6).toFixed(1)+"M":Math.abs(d)>=1e3?(d/1e3).toFixed(1)+"K":d.toFixed(0),a=d=>d==null||isNaN(d)?"0.00":(d*100).toFixed(2),o=e.total_job_effect||0,r=e.total_economic_impact||0,l=e.total_fiscal_cost||0,i=((c=e.monthly_averages)==null?void 0:c.wage_effect)||0,s=(e.details||[]).map(d=>{const m=d.job_effect||0,u=d.wage_effect||0,g=d.economic_impact||0,f=d.fiscal_cost||0;return`
        <tr>
            <td><strong>${d.intervention||"Unknown"}</strong></td>
            <td style="text-align: right; color: ${m>=0?"var(--secondary)":"var(--danger)"};">
                ${m>=0?"+":""}${n(m*12)}/yr
            </td>
            <td style="text-align: right; color: ${u>=0?"var(--secondary)":"var(--danger)"};">
                ${u>=0?"+":""}${a(u)}%
            </td>
            <td style="text-align: right; color: ${g>=0?"var(--secondary)":"var(--danger)"};">
                $${n(g*12)}
            </td>
            <td style="text-align: right; color: ${f<=0?"var(--secondary)":"var(--warning)"};">
                ${f<0?"+":"-"}$${n(Math.abs(f*12))}
            </td>
        </tr>
    `}).join("");return`
        <div style="margin-bottom: 24px;">
            <!-- Summary Cards -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; margin-bottom: 24px;">
                <div style="background: var(--gray-50); padding: 16px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase;">Jobs Impact</div>
                    <div style="font-size: 1.25rem; font-weight: 700; color: ${o>=0?"var(--secondary)":"var(--danger)"};">
                        ${o>=0?"+":""}${n(o)}
                    </div>
                    <div style="font-size: 0.7rem; color: var(--gray-400);">cumulative</div>
                </div>
                <div style="background: var(--gray-50); padding: 16px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase;">Wage Effect</div>
                    <div style="font-size: 1.25rem; font-weight: 700; color: ${i>=0?"var(--secondary)":"var(--danger)"};">
                        ${i>=0?"+":""}${a(i)}%
                    </div>
                    <div style="font-size: 0.7rem; color: var(--gray-400);">monthly avg</div>
                </div>
                <div style="background: var(--gray-50); padding: 16px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase;">Economic Impact</div>
                    <div style="font-size: 1.25rem; font-weight: 700; color: var(--primary);">
                        $${n(r)}
                    </div>
                    <div style="font-size: 0.7rem; color: var(--gray-400);">cumulative GDP</div>
                </div>
                <div style="background: var(--gray-50); padding: 16px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase;">Fiscal Impact</div>
                    <div style="font-size: 1.25rem; font-weight: 700; color: ${l<=0?"var(--secondary)":"var(--warning)"};">
                        ${l<0?"+":"-"}$${n(Math.abs(l))}
                    </div>
                    <div style="font-size: 0.7rem; color: var(--gray-400);">${l<0?"revenue":"cost"}</div>
                </div>
            </div>

            <!-- Intervention Breakdown -->
            ${e.details&&e.details.length>0?`
            <h4 style="font-size: 0.875rem; color: var(--gray-500); margin-bottom: 12px; text-transform: uppercase;">
                Intervention Breakdown
            </h4>
            <div style="overflow-x: auto;">
                <table style="width: 100%; font-size: 0.875rem; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--gray-200);">
                            <th style="text-align: left; padding: 8px 12px;">Intervention</th>
                            <th style="text-align: right; padding: 8px 12px;">Jobs/Year</th>
                            <th style="text-align: right; padding: 8px 12px;">Wage Effect</th>
                            <th style="text-align: right; padding: 8px 12px;">Economic/Year</th>
                            <th style="text-align: right; padding: 8px 12px;">Fiscal/Year</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${s}
                    </tbody>
                </table>
            </div>
            `:""}
        </div>
    `}function nt(e){if(!e)return'<p style="color: var(--gray-500);">No demographics data available.</p>';const t=i=>i==null||isNaN(i)?"0":Math.abs(i)>=1e6?(i/1e6).toFixed(1)+"M":Math.abs(i)>=1e3?(i/1e3).toFixed(1)+"K":Math.round(i).toString(),n=i=>i==null||isNaN(i)?"0":typeof i=="number"?i.toFixed(1):i,a=e.by_age?Object.entries(e.by_age).map(([i,s])=>{const c=s.estimated_displacement||0,d=s.displacement_rate||0;return s.impact_level,`
        <div style="background: var(--gray-50); padding: 12px; border-radius: 8px; min-width: 140px;">
            <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase;">Age ${i}</div>
            <div style="font-size: 1.1rem; font-weight: 600; color: ${c>0?"var(--danger)":"var(--secondary)"};">
                -${t(c)} jobs
            </div>
            <div style="font-size: 0.7rem; color: var(--gray-400);">Risk: ${n(d)}%</div>
        </div>
    `}).join(""):"",o=e.by_education?Object.entries(e.by_education).map(([i,s])=>{const c=s.estimated_displacement||0,d=s.displacement_rate||0;return`
        <div style="background: var(--gray-50); padding: 12px; border-radius: 8px; min-width: 140px;">
            <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase;">${i}</div>
            <div style="font-size: 1.1rem; font-weight: 600; color: ${c>0?"var(--danger)":"var(--secondary)"};">
                -${t(c)} jobs
            </div>
            <div style="font-size: 0.7rem; color: var(--gray-400);">Risk: ${n(d)}%</div>
        </div>
    `}).join(""):"",r=e.most_vulnerable?e.most_vulnerable.slice(0,5).map((i,s)=>`
        <div style="display: flex; justify-content: space-between; padding: 8px; ${s<e.most_vulnerable.length-1?"border-bottom: 1px solid var(--gray-100);":""}">
            <span style="font-weight: 500;">${i.group||"Unknown"}</span>
            <span style="color: var(--danger);">${n(i.displacement_rate)}% at risk</span>
        </div>
    `).join(""):"",l=e.recommendations?e.recommendations.slice(0,4).map(i=>{if(typeof i=="string")return`<li style="margin-bottom: 8px; color: var(--text-secondary);">${i}</li>`;const s=i.target||"General",c=i.actions||[];return`
            <li style="margin-bottom: 12px;">
                <strong style="color: var(--text-primary);">${s}</strong>
                <span style="font-size: 0.75rem; color: ${i.priority==="Critical"?"var(--danger)":i.priority==="High"?"var(--warning)":"var(--gray-500)"}; margin-left: 8px;">(${i.priority||"Medium"} Priority)</span>
                <ul style="margin: 4px 0 0 0; padding-left: 16px; font-size: 0.85rem; color: var(--text-secondary);">
                    ${c.slice(0,2).map(d=>`<li>${d}</li>`).join("")}
                </ul>
            </li>
        `}).join(""):"";return`
        <div style="margin-bottom: 20px;">
            <h4 style="font-size: 0.875rem; color: var(--gray-500); margin-bottom: 12px; text-transform: uppercase;">
                Impact by Age Group
            </h4>
            <div style="display: flex; gap: 12px; flex-wrap: wrap; overflow-x: auto; padding-bottom: 8px;">
                ${a}
            </div>
        </div>

        <div style="margin-bottom: 20px;">
            <h4 style="font-size: 0.875rem; color: var(--gray-500); margin-bottom: 12px; text-transform: uppercase;">
                Impact by Education Level
            </h4>
            <div style="display: flex; gap: 12px; flex-wrap: wrap; overflow-x: auto; padding-bottom: 8px;">
                ${o}
            </div>
        </div>

        ${e.most_vulnerable&&e.most_vulnerable.length>0?`
        <div style="margin-bottom: 20px;">
            <h4 style="font-size: 0.875rem; color: var(--gray-500); margin-bottom: 12px; text-transform: uppercase;">
                Most Vulnerable Groups
            </h4>
            <div style="background: rgba(239, 68, 68, 0.05); border-radius: 8px; overflow: hidden;">
                ${r}
            </div>
        </div>
        `:""}

        ${e.recommendations&&e.recommendations.length>0?`
        <div>
            <h4 style="font-size: 0.875rem; color: var(--gray-500); margin-bottom: 12px; text-transform: uppercase;">
                Policy Recommendations
            </h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 0.875rem;">
                ${l}
            </ul>
        </div>
        `:""}
    `}function at(e){if(!e)return'<p style="color: var(--gray-500);">No skills gap data available.</p>';const t=i=>i==null||isNaN(i)?"$0K":"$"+(i/1e3).toFixed(0)+"K",n=i=>i==null||isNaN(i)?"0":i,a=e.declining_skills?e.declining_skills.slice(0,6).map(i=>`
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(239, 68, 68, 0.05); border-radius: 6px; margin-bottom: 8px;">
            <div>
                <span style="font-weight: 500;">${i.name||"Unknown Skill"}</span>
                <span style="font-size: 0.75rem; color: var(--gray-400); margin-left: 8px;">${i.sector||""}</span>
            </div>
            <span style="color: var(--danger); font-weight: 600;">-${n(i.decline_rate)}%</span>
        </div>
    `).join(""):"",o=e.growing_skills?e.growing_skills.slice(0,6).map(i=>`
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(16, 185, 129, 0.05); border-radius: 6px; margin-bottom: 8px;">
            <div>
                <span style="font-weight: 500;">${i.name||"Unknown Skill"}</span>
                <span style="font-size: 0.75rem; color: var(--gray-400); margin-left: 8px;">${t(i.avg_salary)}</span>
            </div>
            <span style="color: var(--secondary); font-weight: 600;">+${n(i.growth_rate)}%</span>
        </div>
    `).join(""):"",r=e.training_recommendations?e.training_recommendations.slice(0,4).map(i=>{const s=i.skill||i.program||"Training Program",c=i.priority||"Medium",d=i.career_outcomes||i.career_paths||[],m=Array.isArray(i.programs)&&i.programs.length>0?i.programs[0]:null,u=(m==null?void 0:m.duration)||i.duration,g=(m==null?void 0:m.cost)||i.cost||i.estimated_cost,f=(m==null?void 0:m.provider)||i.provider;return`
        <div style="border: 1px solid var(--gray-200); border-radius: 8px; padding: 12px; margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-weight: 600;">${s}</span>
                <span style="font-size: 0.7rem; padding: 2px 8px; border-radius: 4px; background: ${c==="Critical"?"var(--danger)":c==="High"?"var(--warning)":"var(--gray-200)"}; color: ${c==="Critical"||c==="High"?"white":"var(--gray-600)"};">${c}</span>
            </div>
            <div style="display: flex; gap: 16px; font-size: 0.8rem; color: var(--gray-500);">
                ${u?`<span>&#128197; ${u} months</span>`:""}
                ${g?`<span>&#128176; ${g}</span>`:""}
                ${f?`<span>&#127979; ${f}</span>`:""}
            </div>
            ${d.length>0?`
            <div style="margin-top: 8px; font-size: 0.75rem; color: var(--gray-400);">
                Leads to: ${d.slice(0,3).join(", ")}
            </div>
            `:""}
        </div>
    `}).join(""):"";let l="";return e.transition_paths&&(Array.isArray(e.transition_paths)?l=e.transition_paths.slice(0,4).map(i=>`
                <div style="margin-bottom: 10px;">
                    <span style="color: var(--danger);">${i.from_skill||"Unknown"}</span>
                    <span style="margin: 0 8px;">&#8594;</span>
                    <span style="color: var(--secondary);">${i.to_skill||"Unknown"}</span>
                    ${i.training_duration?`<span style="font-size: 0.75rem; color: var(--gray-400); margin-left: 8px;">(${i.training_duration})</span>`:""}
                </div>
            `).join(""):l=Object.entries(e.transition_paths).slice(0,4).map(([i,s])=>`
                <div style="margin-bottom: 10px;">
                    <span style="color: var(--danger);">${i}</span>
                    <span style="margin: 0 8px;">&#8594;</span>
                    <span style="color: var(--secondary);">${Array.isArray(s)?s.slice(0,2).join(", "):typeof s=="string"?s:"Various"}</span>
                </div>
            `).join("")),`
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 20px;">
            <div>
                <h4 style="font-size: 0.875rem; color: var(--danger); margin-bottom: 12px; text-transform: uppercase;">
                    &#128308; Declining Skills
                </h4>
                ${a||'<p style="color: var(--gray-400); font-size: 0.875rem;">No declining skills data</p>'}
            </div>
            <div>
                <h4 style="font-size: 0.875rem; color: var(--secondary); margin-bottom: 12px; text-transform: uppercase;">
                    &#128994; In-Demand Skills
                </h4>
                ${o||'<p style="color: var(--gray-400); font-size: 0.875rem;">No growing skills data</p>'}
            </div>
        </div>

        ${l?`
        <div style="margin-bottom: 20px;">
            <h4 style="font-size: 0.875rem; color: var(--gray-500); margin-bottom: 12px; text-transform: uppercase;">
                Recommended Skill Transitions
            </h4>
            <div style="background: var(--gray-50); border-radius: 8px; padding: 12px; font-size: 0.875rem;">
                ${l}
            </div>
        </div>
        `:""}

        ${r?`
        <div>
            <h4 style="font-size: 0.875rem; color: var(--gray-500); margin-bottom: 12px; text-transform: uppercase;">
                Training Programs
            </h4>
            ${r}
        </div>
        `:""}
    `}async function it(){if(!p){b("No simulation results to export. Run a simulation first.","warning");return}const e=document.getElementById("downloadPDFBtn"),t=e.innerHTML;e.innerHTML='<span class="spinner" style="width: 16px; height: 16px; margin-right: 8px;"></span> Generating PDF...',e.disabled=!0;try{const n={...p};if(typeof demographicsAnalyzer<"u"&&(n.summary.demographics=demographicsAnalyzer.analyzeImpacts(p)),typeof skillsGapAnalyzer<"u"&&(n.summary.skills_gap=skillsGapAnalyzer.analyzeSkillsGap(p)),typeof pdfReportGenerator<"u"){const a=await pdfReportGenerator.generateReport(n);b(`PDF report downloaded: ${a}`,"success")}else throw new Error("PDF generator not available")}catch(n){console.error("PDF generation error:",n),b("Failed to generate PDF report: "+n.message,"error")}finally{e.innerHTML=t,e.disabled=!1}}function D(e){const t=document.getElementById("simulation-results"),n=e.summary,a=typeof aiSummaryService<"u"&&aiSummaryService.isAvailable(),o=typeof scenarioComparison<"u",r=o&&scenarioComparison.canAddMore(),l=o?scenarioComparison.getCount():0,i=o?`
        <button id="addToComparisonBtn" class="btn btn-success" onclick="addToComparison()" ${r?"":"disabled"}>
            ${r?`Add to Comparison (${l}/3)`:"Comparison Full (3/3)"}
        </button>
    `:"",s=A!==null,c=U&&A?sn(A.analysis,A.enhancedParams):"",d=U?`
        <div class="card" id="aiSummaryCard" style="margin-bottom: 24px; border-left: 4px solid var(--primary);">
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 1.25rem;">&#129302;</span> AI-Enhanced Analysis
                </h3>
                <div style="display: flex; gap: 8px;">
                    ${i}
                </div>
            </div>
            <div id="aiSummaryContent" style="line-height: 1.7;">
                ${c}
            </div>
        </div>
    `:`
        <div class="card" id="aiSummaryCard" style="margin-bottom: 24px; border-left: 4px solid var(--primary);">
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 1.25rem;">&#129302;</span> AI Analysis
                </h3>
                <div style="display: flex; gap: 8px;">
                    ${i}
                </div>
            </div>
            <div id="aiSummaryContent" style="line-height: 1.7;">
                ${s?`
                    <div style="display: flex; align-items: center; gap: 16px; padding: 16px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1)); border-radius: 8px; margin-bottom: 16px;">
                        <div style="flex: 1;">
                            <p style="margin: 0 0 4px 0; font-weight: 600; color: var(--text-primary);">
                                ✨ AI-Enhanced Analysis Available
                            </p>
                            <p style="margin: 0; font-size: 0.875rem; color: var(--text-secondary);">
                                View the comprehensive AI analysis with policy recommendations and insights.
                            </p>
                        </div>
                        <button class="btn" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; white-space: nowrap;" onclick="showAIAnalysis()">
                            View AI Report
                        </button>
                    </div>
                `:""}
                ${a?`
                    <p style="color: var(--gray-500); margin-bottom: 16px;">
                        Get AI-powered analysis of your simulation results, including key insights,
                        policy implications, and risk assessments.
                    </p>
                    <button class="btn btn-primary" onclick="generateAISummary(currentResults)" id="generateAIBtn">
                        Generate AI Analysis
                    </button>
                `:`
                    <p style="color: var(--gray-500);">
                        Configure your Gemini API key to get AI-powered analysis of your simulation results.
                    </p>
                    <button class="btn btn-primary btn-sm" onclick="showAISettingsModal()" style="margin-top: 12px;">
                        Configure API Key
                    </button>
                `}
            </div>
        </div>
    `;t.innerHTML=`
        <div class="fade-in">
            ${d}
            ${E.createSummaryHTML(n)}

            <div class="card-grid">
                <div class="card">
                    <div class="card-header">
                        <h3>Unemployment Projection</h3>
                    </div>
                    <div class="chart-container">
                        <canvas id="projectedURChart"></canvas>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h3>AI Adoption Curve</h3>
                    </div>
                    <div class="chart-container">
                        <canvas id="adoptionCurveChart"></canvas>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>AI Job Impact Over Time</h3>
                </div>
                <div class="chart-container large">
                    <canvas id="jobImpactChart"></canvas>
                </div>
            </div>

            <div class="card-grid">
                <div class="card">
                    <div class="card-header">
                        <h3>Wage Trends</h3>
                    </div>
                    <div class="chart-container">
                        <canvas id="wageTrendChart"></canvas>
                    </div>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h3>Productivity</h3>
                    </div>
                    <div class="chart-container">
                        <canvas id="productivityChart"></canvas>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>Sector Employment Changes</h3>
                </div>
                <div class="chart-container large">
                    <canvas id="sectorChangeChart"></canvas>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3>Simulation Inputs & Assumptions</h3>
                </div>
                <table class="data-table">
                    <tbody>
                        <tr>
                            <td><strong>Scenario Name</strong></td>
                            <td>${L(e.scenario.name)}</td>
                        </tr>
                        <tr>
                            <td><strong>Timeframe</strong></td>
                            <td>${e.scenario.timeframe.start_year} - ${e.scenario.timeframe.end_year}</td>
                        </tr>
                        <tr>
                            <td><strong>Target Unemployment</strong></td>
                            <td>${e.scenario.targets.unemployment_rate}%</td>
                        </tr>
                        <tr>
                            <td><strong>Target AI Adoption</strong></td>
                            <td>${e.scenario.targets.ai_adoption_rate}%</td>
                        </tr>
                        <tr>
                            <td><strong>Automation Pace</strong></td>
                            <td>${e.scenario.targets.automation_pace}</td>
                        </tr>
                        <tr>
                            <td><strong>Adoption Curve</strong></td>
                            <td>${e.scenario.ai_parameters.adoption_curve.replace("_","-")}</td>
                        </tr>
                        <tr>
                            <td><strong>New Job Multiplier</strong></td>
                            <td>${e.scenario.ai_parameters.new_job_multiplier}</td>
                        </tr>
                        <tr>
                            <td><strong>Active Interventions</strong></td>
                            <td>${e.scenario.interventions.length>0?e.scenario.interventions.map(m=>m.name).join(", "):"None"}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Timeline Player Section -->
            <div class="card" id="timelineCard" style="border-left: 4px solid var(--secondary);">
                <div class="card-header">
                    <h3 style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.25rem;">&#9199;</span> Timeline Player
                    </h3>
                    <span style="font-size: 0.875rem; color: var(--gray-500);">Animate through simulation years</span>
                </div>
                <div id="timeline-player-container" style="padding: 20px;">
                    <div style="text-align: center; color: var(--gray-500);">
                        <div class="spinner" style="margin: 0 auto 12px; width: 24px; height: 24px;"></div>
                        <p>Loading timeline player...</p>
                    </div>
                </div>
            </div>

            <!-- Monte Carlo Analysis Section -->
            <div class="card" id="monteCarloCard" style="border-left: 4px solid var(--info);">
                <div class="card-header">
                    <h3 style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.25rem;">&#127922;</span> Monte Carlo Analysis
                    </h3>
                    <button class="btn btn-primary btn-sm" onclick="runMonteCarloAnalysis()" id="runMonteCarloBtn">
                        Run 1000 Iterations
                    </button>
                </div>
                <div id="monteCarloContent">
                    <p style="color: var(--gray-500); margin-bottom: 12px;">
                        Monte Carlo simulation runs your scenario 1000+ times with randomized parameters
                        to show probability distributions instead of single point estimates.
                    </p>
                    <p style="font-size: 0.875rem; color: var(--gray-400);">
                        Click "Run 1000 Iterations" to see the range of possible outcomes and their likelihoods.
                    </p>
                </div>
            </div>

            <!-- Intervention Impact Section -->
            ${e.scenario.interventions&&e.scenario.interventions.length>0&&e.summary.interventions?`
            <div class="card" id="interventionImpactCard" style="border-left: 4px solid var(--secondary);">
                <div class="card-header">
                    <h3 style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.25rem;">&#128200;</span> Intervention Impact
                    </h3>
                    <span style="font-size: 0.875rem; color: var(--gray-500);">Effects on simulation outcomes</span>
                </div>
                <div id="interventionImpactContent">
                    ${tt(e.summary.interventions,e.scenario.interventions)}
                </div>
            </div>
            `:""}

            <!-- Intervention Cost Calculator Section -->
            ${e.scenario.interventions&&e.scenario.interventions.length>0?`
            <div class="card" id="costCalculatorCard" style="border-left: 4px solid var(--warning);">
                <div class="card-header">
                    <h3 style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.25rem;">&#128176;</span> Intervention Cost Analysis
                    </h3>
                </div>
                <div id="costCalculatorContent">
                    ${typeof interventionCostCalculator<"u"?interventionCostCalculator.generateSummaryHTML(interventionCostCalculator.calculateAllCosts(e.scenario.interventions,e)):'<p style="color: var(--gray-500);">Cost calculator not available.</p>'}
                </div>
            </div>
            `:""}

            <!-- Demographics Analysis Section -->
            <div class="card" id="demographicsCard" style="border-left: 4px solid #ec4899;">
                <div class="card-header">
                    <h3 style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.25rem;">&#128101;</span> Demographic Impact Analysis
                    </h3>
                    <span style="font-size: 0.875rem; color: var(--gray-500);">Impact by age, education, and gender</span>
                </div>
                <div id="demographicsContent">
                    ${typeof demographicsAnalyzer<"u"?nt(demographicsAnalyzer.analyzeImpacts(e)):'<p style="color: var(--gray-500);">Demographics analyzer not available.</p>'}
                </div>
            </div>

            <!-- Skills Gap Analysis Section -->
            <div class="card" id="skillsGapCard" style="border-left: 4px solid #14b8a6;">
                <div class="card-header">
                    <h3 style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.25rem;">&#128218;</span> Skills Gap Analysis
                    </h3>
                    <span style="font-size: 0.875rem; color: var(--gray-500);">Declining and growing skills with training paths</span>
                </div>
                <div id="skillsGapContent">
                    ${typeof skillsGapAnalyzer<"u"?at(skillsGapAnalyzer.analyzeSkillsGap(e)):'<p style="color: var(--gray-500);">Skills gap analyzer not available.</p>'}
                </div>
            </div>

            <!-- Export Actions Section -->
            <div class="card" id="exportActionsCard" style="border-left: 4px solid var(--gray-400);">
                <div class="card-header">
                    <h3 style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.25rem;">&#128190;</span> Export & Download
                    </h3>
                </div>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <button class="btn btn-primary" onclick="downloadPDFReport()" id="downloadPDFBtn">
                        <span style="margin-right: 6px;">&#128196;</span> Download PDF Report
                    </button>
                    <button class="btn btn-outline" onclick="exportResults()">
                        <span style="margin-right: 6px;">&#128202;</span> Export JSON Data
                    </button>
                    <button class="btn btn-outline" onclick="copyScenarioURL()">
                        <span style="margin-right: 6px;">&#128279;</span> Copy Share URL
                    </button>
                </div>
            </div>
        </div>
    `,setTimeout(()=>{E.createUnemploymentChart("projectedURChart",e.results),E.createAdoptionChart("adoptionCurveChart",e.results),E.createJobImpactChart("jobImpactChart",e.results),E.createWageChart("wageTrendChart",e.results),E.createProductivityChart("productivityChart",e.results),E.createSectorImpactChart("sectorChangeChart",e.results[0].sectors,e.results[e.results.length-1].sectors)},100),typeof initializeTimeline<"u"&&setTimeout(()=>{initializeTimeline(e)},150)}function ot(){document.getElementById("interventionModal").style.display="flex",ge()}function ue(){document.getElementById("interventionModal").style.display="none"}function ge(){const e=document.getElementById("interventionType").value,n=v.interventionTypes[e].parameters;let a="";for(const[o,r]of Object.entries(n))r.type==="number"?a+=`
                <div class="form-group">
                    <label style="color: var(--gray-700);">${o.replace(/_/g," ").replace(/\b\w/g,l=>l.toUpperCase())}
                        ${r.unit?`(${r.unit})`:""}</label>
                    <input type="number" id="param_${o}" value="${r.default}"
                        min="${r.min||0}" max="${r.max||100}"
                        style="color: var(--gray-900);">
                </div>
            `:r.type==="select"&&(a+=`
                <div class="form-group">
                    <label style="color: var(--gray-700);">${o.replace(/_/g," ").replace(/\b\w/g,l=>l.toUpperCase())}</label>
                    <select id="param_${o}" style="color: var(--gray-900);">
                        ${r.options.map(l=>`<option value="${l}" ${l===r.default?"selected":""}>${l.replace(/_/g," ")}</option>`).join("")}
                    </select>
                </div>
            `);document.getElementById("interventionParams").innerHTML=a}function rt(){const e=document.getElementById("interventionType").value,n=v.interventionTypes[e].parameters,a={};for(const o of Object.keys(n)){const r=document.getElementById(`param_${o}`);r&&(a[o]=n[o].type==="number"?parseFloat(r.value):r.value)}v.addIntervention(e,a),M(),ue()}function st(e){v.addIntervention(e),M()}function M(){const e=document.getElementById("interventionsList"),t=v.interventions;if(t.length===0){e.innerHTML='<p class="no-interventions-message">No interventions added</p>';return}let n="";for(const a of t)n+=`
            <div class="intervention-card">
                <div class="header">
                    <span class="name">${a.name}</span>
                    <div class="toggle ${a.active?"active":""}"
                         onclick="toggleIntervention('${a.id}')"></div>
                </div>
                <div class="intervention-card-footer">
                    <span class="category">${a.category.replace("_"," ")}</span>
                    <button class="btn btn-sm remove-btn" onclick="removeIntervention('${a.id}')">Remove</button>
                </div>
            </div>
        `;e.innerHTML=n}function lt(e){const t=v.interventions.find(n=>n.id==e);t&&(t.active=!t.active,M())}function dt(e){v.removeIntervention(parseFloat(e)),M()}function ct(){if(!p){alert("No simulation results to export. Please run a simulation first.");return}confirm(`Export as PDF report?

Click OK for PDF report
Click Cancel for JSON data export`)?ye():ve()}function ye(){if(!p){alert("No simulation results to export. Please run a simulation first.");return}typeof pdfExporter<"u"?pdfExporter.generateReport(p):alert("PDF export not available.")}function ve(){if(!p){alert("No simulation results to export. Please run a simulation first.");return}const e=h.exportResults("json"),t=new Blob([e],{type:"application/json"}),n=URL.createObjectURL(t),a=document.createElement("a");a.href=n,a.download=`simulation-results-${Date.now()}.json`,a.click(),URL.revokeObjectURL(n)}function mt(){X()}function X(){p=null,v.interventions=[],document.getElementById("scenarioName").value=z.scenarioName,document.getElementById("targetYear").value=z.targetYear,document.getElementById("targetUR").value=z.targetUR,document.getElementById("urValue").textContent=z.targetUR.toFixed(1),document.getElementById("aiAdoption").value=z.aiAdoption,document.getElementById("aiValue").textContent=z.aiAdoption,document.getElementById("automationPace").value=z.automationPace,document.getElementById("adoptionCurve").value=z.adoptionCurve,M(),document.getElementById("simulation-results").innerHTML=`
        <div class="card" style="text-align: center; padding: 60px;">
            <h3 style="margin-bottom: 16px;">No Simulation Run Yet</h3>
            <p style="color: var(--gray-500); margin-bottom: 24px;">
                Configure your scenario parameters and click "Run Simulation" to see projected impacts.
            </p>
            <button class="btn btn-primary" onclick="runSimulation()">Run Simulation</button>
        </div>
    `,pe("snapshot"),document.querySelectorAll(".nav-tab").forEach(e=>e.classList.remove("active")),document.querySelectorAll(".nav-tab")[0].classList.add("active")}function F(){try{const e=localStorage.getItem(W);return e?JSON.parse(e):[]}catch(e){return console.error("Error loading saved simulations:",e),[]}}function pt(){if(!p){alert("No simulation results to save. Please run a simulation first.");return}const e=prompt("Enter a name for this simulation:",p.scenario.name);if(!e)return;const t=F(),n={id:Date.now(),name:e,savedAt:new Date().toISOString(),config:{scenarioName:p.scenario.name,targetYear:p.scenario.timeframe.end_year,targetUR:p.scenario.targets.unemployment_rate,aiAdoption:p.scenario.targets.ai_adoption_rate,automationPace:p.scenario.targets.automation_pace,adoptionCurve:p.scenario.ai_parameters.adoption_curve},interventions:v.interventions.map(a=>({type:a.type,parameters:a.parameters,active:a.active})),results:p,summary:p.summary};t.push(n);try{localStorage.setItem(W,JSON.stringify(t)),V(),alert(`Simulation "${e}" saved successfully!`)}catch(a){console.error("Error saving simulation:",a),alert("Failed to save simulation. Storage may be full.")}}function ut(e){const n=F().find(a=>a.id===e);if(!n){alert("Simulation not found.");return}document.getElementById("scenarioName").value=n.config.scenarioName,document.getElementById("targetYear").value=n.config.targetYear,document.getElementById("targetUR").value=n.config.targetUR,document.getElementById("urValue").textContent=n.config.targetUR,document.getElementById("aiAdoption").value=n.config.aiAdoption,document.getElementById("aiValue").textContent=n.config.aiAdoption,document.getElementById("automationPace").value=n.config.automationPace,document.getElementById("adoptionCurve").value=n.config.adoptionCurve,v.interventions=[];for(const a of n.interventions)v.addIntervention(a.type,a.parameters,{active:a.active});M(),p=n.results,D(p),document.querySelectorAll(".section").forEach(a=>a.classList.remove("active")),document.getElementById("simulation-section").classList.add("active"),document.querySelectorAll(".nav-tab").forEach(a=>a.classList.remove("active")),document.querySelectorAll(".nav-tab")[3].classList.add("active"),Q()}function gt(e,t){if(t&&t.stopPropagation(),!confirm("Are you sure you want to delete this simulation?"))return;const a=F().filter(o=>o.id!==e);try{localStorage.setItem(W,JSON.stringify(a)),V()}catch(o){console.error("Error deleting simulation:",o),alert("Failed to delete simulation.")}}function V(){const e=document.getElementById("savedSimulationsList");if(!e)return;const t=F();if(t.length===0){e.innerHTML='<p style="font-size: 0.875rem; color: var(--gray-400);">No saved simulations</p>';return}let n="";const a=t.slice(-3).reverse();for(const o of a){const r=new Date(o.savedAt).toLocaleDateString();n+=`
            <div class="saved-sim-card" onclick="loadSavedSimulation(${o.id})" style="
                background: var(--gray-700);
                border-radius: 6px;
                padding: 10px;
                margin-bottom: 8px;
                cursor: pointer;
                transition: background 0.2s;
            " onmouseover="this.style.background='var(--gray-600)'" onmouseout="this.style.background='var(--gray-700)'">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <div style="font-weight: 500; font-size: 0.875rem;">${L(o.name)}</div>
                        <div style="font-size: 0.75rem; color: var(--gray-400);">${r}</div>
                        <div style="font-size: 0.75rem; color: var(--gray-400);">
                            UR: ${o.summary.labor_market_changes.unemployment_rate.final}%
                        </div>
                    </div>
                    <button class="btn btn-sm" style="padding: 2px 6px; background: var(--gray-600); font-size: 0.7rem;"
                            onclick="deleteSavedSimulation(${o.id}, event)">X</button>
                </div>
            </div>
        `}t.length>3&&(n+=`
            <button class="btn btn-outline btn-block btn-sm" onclick="showSavedSimulationsModal()" style="margin-top: 8px;">
                View All (${t.length})
            </button>
        `),e.innerHTML=n}function yt(){const e=F(),t=document.getElementById("savedSimulationsModal");let n="";if(e.length===0)n='<p style="text-align: center; color: var(--gray-500);">No saved simulations</p>';else for(const a of e.slice().reverse()){const o=new Date(a.savedAt).toLocaleDateString(),r=new Date(a.savedAt).toLocaleTimeString();n+=`
                <div class="card" style="margin-bottom: 12px; cursor: pointer;" onclick="loadSavedSimulation(${a.id})">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <h4 style="margin-bottom: 4px;">${L(a.name)}</h4>
                            <p style="font-size: 0.875rem; color: var(--gray-500); margin-bottom: 8px;">
                                Saved: ${o} at ${r}
                            </p>
                            <div style="display: flex; gap: 16px; font-size: 0.875rem;">
                                <span><strong>Target Year:</strong> ${a.config.targetYear}</span>
                                <span><strong>Final UR:</strong> ${a.summary.labor_market_changes.unemployment_rate.final}%</span>
                                <span><strong>AI Adoption:</strong> ${a.summary.ai_impact.ai_adoption.final}%</span>
                            </div>
                            ${a.interventions.length>0?`
                                <div style="margin-top: 8px; font-size: 0.75rem; color: var(--gray-400);">
                                    Interventions: ${a.interventions.filter(l=>l.active).map(l=>l.type.replace(/_/g," ")).join(", ")}
                                </div>
                            `:""}
                        </div>
                        <button class="btn btn-danger btn-sm" onclick="deleteSavedSimulation(${a.id}, event)">Delete</button>
                    </div>
                </div>
            `}document.getElementById("savedSimulationsContent").innerHTML=n,t.style.display="flex"}function Q(){document.getElementById("savedSimulationsModal").style.display="none"}function vt(){if(confirm("Are you sure you want to delete ALL saved simulations? This cannot be undone."))try{localStorage.removeItem(W),V(),Q(),alert("All saved simulations have been deleted.")}catch(e){console.error("Error clearing simulations:",e),alert("Failed to clear simulations.")}}function B(){const e=document.getElementById("hypotheticalIndicatorsList");if(!e||typeof hypotheticalIndicators>"u")return;const t=hypotheticalIndicators.getAllIndicators(),n=hypotheticalIndicators.getCategoryDisplayNames(),a={};Object.values(t).forEach(r=>{const l=r.category||"other";a[l]||(a[l]=[]),a[l].push(r)});let o="";Object.entries(a).forEach(([r,l])=>{o+=`
            <div style="margin-bottom: 20px;">
                <h4 style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                    ${n[r]||r}
                </h4>
                <div style="display: grid; gap: 12px;">
        `,l.forEach(i=>{const s=i.manuallyAdjusted,c=i.isCustom,d=i.trend==="increasing"?"↑":i.trend==="decreasing"?"↓":"→",m=i.trend==="increasing"?"positive":i.trend==="decreasing"?"negative":"";o+=`
                <div class="hypothetical-indicator-card" style="
                    background: var(--gray-50);
                    border: 1px solid ${s?"var(--warning)":"var(--gray-200)"};
                    border-radius: 8px;
                    padding: 16px;
                    ${s?"border-left: 3px solid var(--warning);":""}
                ">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="font-size: 1.25rem;">${i.icon}</span>
                            <div>
                                <div style="font-weight: 600; color: var(--gray-800);">
                                    ${i.name}
                                    ${c?'<span class="tag tag-medium" style="margin-left: 8px; font-size: 0.65rem;">Custom</span>':""}
                                    ${s?'<span class="tag tag-high" style="margin-left: 8px; font-size: 0.65rem;">Adjusted</span>':""}
                                </div>
                                <div style="font-size: 0.75rem; color: var(--gray-500);">${i.shortName} • ${i.source}</div>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--gray-800);">
                                ${K(i.value,i.unit)}
                            </div>
                            <div class="change ${m}" style="font-size: 0.75rem;">
                                ${d} ${i.trend}
                            </div>
                        </div>
                    </div>

                    <p style="font-size: 0.8rem; color: var(--gray-600); margin-bottom: 12px;">
                        ${i.description}
                    </p>

                    <div style="margin-bottom: 8px;">
                        <label style="font-size: 0.75rem; color: var(--gray-500); display: flex; justify-content: space-between;">
                            <span>Adjust Value</span>
                            <span>${i.range.min} - ${i.range.max}</span>
                        </label>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <input type="range"
                                   id="slider_${i.id}"
                                   min="${i.range.min}"
                                   max="${i.range.max}"
                                   step="${(i.range.max-i.range.min)/100}"
                                   value="${i.value}"
                                   onchange="updateIndicatorValue('${i.id}', this.value)"
                                   style="flex: 1;">
                            <input type="number"
                                   id="input_${i.id}"
                                   value="${i.value.toFixed(1)}"
                                   min="${i.range.min}"
                                   max="${i.range.max}"
                                   step="0.1"
                                   onchange="updateIndicatorValue('${i.id}', this.value)"
                                   style="width: 70px; padding: 4px 8px; border: 1px solid var(--gray-300); border-radius: 4px; color: var(--gray-800);">
                        </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-size: 0.7rem; color: var(--gray-400);">
                            Linked: ${i.linkedMetrics.length>0?i.linkedMetrics.join(", "):"None"}
                        </div>
                        <div style="display: flex; gap: 8px;">
                            ${s?`
                                <button class="btn btn-sm btn-outline" onclick="resetIndicator('${i.id}')" style="font-size: 0.7rem; padding: 2px 8px;">
                                    Reset
                                </button>
                            `:""}
                            ${c?`
                                <button class="btn btn-sm btn-danger" onclick="deleteCustomIndicator('${i.id}')" style="font-size: 0.7rem; padding: 2px 8px;">
                                    Delete
                                </button>
                            `:""}
                            <button class="btn btn-sm btn-outline" onclick="showIndicatorDetails('${i.id}')" style="font-size: 0.7rem; padding: 2px 8px;">
                                Details
                            </button>
                        </div>
                    </div>
                </div>
            `}),o+=`
                </div>
            </div>
        `}),e.innerHTML=o}function K(e,t){switch(t){case"percent":case"percent_workers":case"percent_jobs_exposed":case"percent_augmented":case"percent_premium":case"percent_monthly":case"percent_new_roles":case"percent_annual_change":return`${e.toFixed(1)}%`;case"index_0_100":return e.toFixed(0);case"millions":return`${e.toFixed(1)}M`;case"thousands":return`${e.toFixed(0)}K`;case"currency":return`$${e.toFixed(0)}`;case"ratio":return e.toFixed(2);default:return e.toFixed(1)}}function ft(e,t){if(typeof hypotheticalIndicators>"u")return;const n=parseFloat(t);hypotheticalIndicators.setIndicatorValue(e,n);const a=document.getElementById(`slider_${e}`),o=document.getElementById(`input_${e}`);a&&(a.value=n),o&&(o.value=n.toFixed(1)),B()}function bt(e){typeof hypotheticalIndicators>"u"||(hypotheticalIndicators.resetIndicator(e),B())}function ht(){confirm("Reset all hypothetical indicators to their default values?")&&(typeof hypotheticalIndicators>"u"||(hypotheticalIndicators.resetAllIndicators(),B()))}function xt(e){if(typeof hypotheticalIndicators>"u")return;const t=hypotheticalIndicators.getIndicator(e);if(!t)return;const n=Object.entries(t.linkageFormula).map(([a,o])=>`${a}: ${o>0?"+":""}${o}`).join(", ")||"None";alert(`${t.icon} ${t.name} (${t.shortName})

Description:
${t.description}

Methodology:
${t.methodology}

Source: ${t.source}
${t.sourceUrl?`URL: ${t.sourceUrl}`:""}

Current Value: ${K(t.value,t.unit)}
Base Value: ${K(t.baseValue,t.unit)}
Range: ${t.range.min} - ${t.range.max}

Linkage Coefficients:
${n}

Confidence: ${t.confidence}
Trend: ${t.trend}`)}function wt(){const e=document.getElementById("sourcesDetails");e&&(e.style.display=e.style.display==="none"?"block":"none")}function It(){document.getElementById("customIndicatorModal").style.display="flex",document.getElementById("customIndName").value="",document.getElementById("customIndShortName").value="",document.getElementById("customIndDescription").value="",document.getElementById("customIndValue").value="",document.getElementById("customIndMin").value="0",document.getElementById("customIndMax").value="100",document.getElementById("customIndCategory").value="custom",document.getElementById("customIndIcon").value="📊",document.getElementById("link_unemployment").checked=!1,document.getElementById("link_ai_adoption").checked=!1,document.getElementById("link_productivity").checked=!1,document.getElementById("link_wages").checked=!1}function fe(){document.getElementById("customIndicatorModal").style.display="none"}function _t(){if(typeof hypotheticalIndicators>"u")return;const e=document.getElementById("customIndName").value.trim(),t=parseFloat(document.getElementById("customIndValue").value);if(!e){alert("Please enter an indicator name.");return}if(isNaN(t)){alert("Please enter a valid initial value.");return}const n=[],a={};document.getElementById("link_unemployment").checked&&(n.push("unemployment_rate"),a.unemployment_rate=.2),document.getElementById("link_ai_adoption").checked&&(n.push("ai_adoption"),a.ai_adoption=.3),document.getElementById("link_productivity").checked&&(n.push("productivity_growth"),a.productivity_growth=.2),document.getElementById("link_wages").checked&&(n.push("wage_growth"),a.wage_growth=.15);const o={name:e,shortName:document.getElementById("customIndShortName").value.trim()||e.substring(0,4).toUpperCase(),description:document.getElementById("customIndDescription").value.trim(),value:t,unit:document.getElementById("customIndUnit").value,range:{min:parseFloat(document.getElementById("customIndMin").value)||0,max:parseFloat(document.getElementById("customIndMax").value)||100},category:document.getElementById("customIndCategory").value,icon:document.getElementById("customIndIcon").value,linkedMetrics:n,linkageFormula:a};hypotheticalIndicators.addCustomIndicator(o),fe(),B(),alert(`Custom indicator "${e}" created successfully!`)}function $t(e){confirm("Are you sure you want to delete this custom indicator?")&&(typeof hypotheticalIndicators>"u"||(hypotheticalIndicators.removeCustomIndicator(e),B()))}function be(){const e=document.getElementById("aiSettingsStatus");e&&(typeof aiSummaryService<"u"&&aiSummaryService.isAvailable()?e.innerHTML=`
            <p style="font-size: 0.875rem; color: var(--secondary);">
                &#10003; AI analysis available
            </p>
        `:e.innerHTML=`
            <p style="font-size: 0.875rem; color: var(--gray-400);">AI analysis unavailable</p>
        `)}async function he(e){const t=document.getElementById("aiSummaryContent");if(t){t.innerHTML=`
        <div style="display: flex; align-items: center; gap: 12px; color: var(--gray-500);">
            <div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div>
            <span>Generating AI analysis...</span>
        </div>
    `;try{const a=(await aiSummaryService.generateSummary(e)).split(`

`).map(o=>`<p style="margin-bottom: 16px;">${o.replace(/\n/g,"<br>")}</p>`).join("");t.innerHTML=`
            <div class="ai-summary-text">
                ${a}
            </div>
            <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--gray-200); display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.75rem; color: var(--gray-400);">
                    Generated by Google Gemini AI
                </span>
                <button class="btn btn-sm btn-outline" onclick="regenerateAISummary()">
                    Regenerate
                </button>
            </div>
        `}catch(n){console.error("AI Summary error:",n),t.innerHTML=`
            <div style="color: var(--danger);">
                <p style="margin-bottom: 8px;"><strong>Error generating AI analysis:</strong></p>
                <p style="margin-bottom: 12px;">${n.message}</p>
                <button class="btn btn-sm btn-outline" onclick="regenerateAISummary()">Try Again</button>
            </div>
        `}}}function Et(){p&&he(p)}function Y(){const e=document.getElementById("comparison-content"),t=document.getElementById("comparisonCount"),n=document.getElementById("clearComparisonBtn");if(!e||typeof scenarioComparison>"u")return;const a=scenarioComparison.getCount();t&&(t.textContent=`${a}/3 scenarios`),n&&(n.style.display=a>0?"inline-block":"none"),e.innerHTML=scenarioComparison.generateComparisonHTML(),a>=2&&setTimeout(()=>{scenarioComparison.renderCharts()},100)}function Ct(){if(!p){alert("No simulation results to add. Please run a simulation first.");return}if(typeof scenarioComparison>"u"){alert("Comparison feature not available.");return}const e={targetYear:p.scenario.timeframe.end_year,targetUR:p.scenario.targets.unemployment_rate,aiAdoption:p.scenario.targets.ai_adoption_rate,automationPace:p.scenario.targets.automation_pace,interventions:p.scenario.interventions},t=p.scenario.name||`Scenario ${scenarioComparison.getCount()+1}`,n=scenarioComparison.addScenario(t,e,p);n.success?(ee(),alert(`"${t}" added to comparison! Go to "Compare Scenarios" tab to view.`)):alert(n.message)}function ee(){const e=document.getElementById("addToComparisonBtn");if(e&&typeof scenarioComparison<"u"){const t=scenarioComparison.getCount();scenarioComparison.canAddMore()?(e.disabled=!1,e.innerHTML=`Add to Comparison (${t}/3)`):(e.disabled=!0,e.innerHTML="Comparison Full (3/3)")}}function St(){confirm("Are you sure you want to clear all scenarios from comparison?")&&typeof scenarioComparison<"u"&&(scenarioComparison.clearAll(),Y(),ee())}function At(e){typeof scenarioComparison<"u"&&(scenarioComparison.removeScenario(e),Y(),ee())}function te(){const e=document.getElementById("occupation-content");!e||typeof occupationDrilldown>"u"||(e.innerHTML=occupationDrilldown.generateOccupationListHTML())}function kt(e){const t=document.getElementById("occupation-content");if(!t||typeof occupationDrilldown>"u")return;const n=parseInt(document.getElementById("aiAdoption").value)||70,a=parseInt(document.getElementById("targetYear").value)||2029;t.innerHTML=occupationDrilldown.generateDetailedViewHTML(e,n,a)}function Mt(){te()}function xe(){const e=document.getElementById("sensitivity-content");!e||typeof sensitivityAnalysis>"u"||(e.innerHTML=sensitivityAnalysis.generateOverviewHTML())}async function Bt(e){const t=document.getElementById("sensitivity-results");if(!(!t||typeof sensitivityAnalysis>"u")){t.innerHTML=`
        <div class="card" style="text-align: center; padding: 40px;">
            <div class="loading">
                <div class="spinner"></div>
                <span>Running sensitivity analysis...</span>
            </div>
            <p style="color: var(--gray-500); margin-top: 16px; font-size: 0.875rem;">
                This may take a moment as multiple simulations are run.
            </p>
        </div>
    `;try{const n={name:"Sensitivity Analysis",end_year:parseInt(document.getElementById("targetYear").value),target_unemployment:parseFloat(document.getElementById("targetUR").value),ai_adoption_rate:parseInt(document.getElementById("aiAdoption").value),automation_pace:document.getElementById("automationPace").value,adoption_curve:document.getElementById("adoptionCurve").value},a=await sensitivityAnalysis.runAnalysis(e,h,n);t.innerHTML=sensitivityAnalysis.generateAnalysisHTML(a)}catch(n){console.error("Sensitivity analysis error:",n),t.innerHTML=`
            <div class="card" style="text-align: center; padding: 40px; color: var(--danger);">
                <h3>Analysis Error</h3>
                <p>${n.message}</p>
                <button class="btn btn-outline" onclick="renderSensitivityOverview()" style="margin-top: 16px;">
                    Try Again
                </button>
            </div>
        `}}}async function zt(){typeof realMetricsSystem<"u"&&_&&(await realMetricsSystem.initialize(_),ne(),Lt())}function ne(){const e=document.getElementById("realMetricsList");if(!e||typeof realMetricsSystem>"u")return;const t=realMetricsSystem.getMetricsByCategory();if(!t){e.innerHTML='<p style="color: var(--gray-500);">Loading metrics...</p>';return}let n="";Object.entries(t).forEach(([a,o])=>{n+=`
            <div style="margin-bottom: 24px;">
                <h4 style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px;">
                    <span>${o.icon}</span> ${o.category}
                </h4>
                <div style="display: grid; gap: 12px;">
        `,Object.values(o.metrics).forEach(r=>{const l=r.manuallyAdjusted,i=r.trend==="increasing"?"↑":r.trend==="decreasing"?"↓":"→",s=r.trend==="increasing"?"positive":r.trend==="decreasing"?"negative":"";n+=`
                <div class="real-metric-card" style="
                    background: var(--gray-50);
                    border: 1px solid ${l?"var(--warning)":"var(--gray-200)"};
                    border-radius: 8px;
                    padding: 16px;
                    ${l?"border-left: 3px solid var(--warning);":""}
                ">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div>
                                <div style="font-weight: 600; color: var(--gray-800);">
                                    ${r.name}
                                    ${l?'<span class="tag tag-high" style="margin-left: 8px; font-size: 0.65rem;">Adjusted</span>':""}
                                </div>
                                <div style="font-size: 0.75rem; color: var(--gray-500);">
                                    ${r.shortName} • ${r.source} • ${r.date||"Current"}
                                </div>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.5rem; font-weight: 700; color: var(--gray-800);">
                                ${G(r.value,r.unit)}
                            </div>
                            <div class="change ${s}" style="font-size: 0.75rem;">
                                ${i} ${r.trend}
                            </div>
                        </div>
                    </div>

                    <p style="font-size: 0.8rem; color: var(--gray-600); margin-bottom: 12px;">
                        ${r.description}
                    </p>

                    <div style="margin-bottom: 8px;">
                        <label style="font-size: 0.75rem; color: var(--gray-500); display: flex; justify-content: space-between;">
                            <span>Adjust Value</span>
                            <span>${G(r.range.min,r.unit)} - ${G(r.range.max,r.unit)}</span>
                        </label>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <input type="range"
                                   id="realmetric_slider_${r.id}"
                                   min="${r.range.min}"
                                   max="${r.range.max}"
                                   step="${(r.range.max-r.range.min)/100}"
                                   value="${r.value}"
                                   onchange="updateRealMetricValue('${r.id}', this.value)"
                                   style="flex: 1;">
                            <input type="number"
                                   id="realmetric_input_${r.id}"
                                   value="${Tt(r.value,r.unit)}"
                                   min="${r.range.min}"
                                   max="${r.range.max}"
                                   step="${Rt(r.unit)}"
                                   onchange="updateRealMetricValue('${r.id}', this.value)"
                                   style="width: 100px; padding: 4px 8px; border: 1px solid var(--gray-300); border-radius: 4px; color: var(--gray-800);">
                        </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-size: 0.7rem; color: var(--gray-400);">
                            ${r.seriesId?`Series: ${r.seriesId}`:""}
                        </div>
                        <div style="display: flex; gap: 8px;">
                            ${l?`
                                <button class="btn btn-sm btn-outline" onclick="resetRealMetric('${r.id}')" style="font-size: 0.7rem; padding: 2px 8px;">
                                    Reset
                                </button>
                            `:""}
                            <button class="btn btn-sm btn-outline" onclick="showRealMetricDetails('${r.id}')" style="font-size: 0.7rem; padding: 2px 8px;">
                                Details
                            </button>
                        </div>
                    </div>
                </div>
            `}),n+=`
                </div>
            </div>
        `}),e.innerHTML=n}function G(e,t){switch(t){case"percent":return`${e.toFixed(1)}%`;case"millions":return e>=1e6?`${(e/1e6).toFixed(1)}M`:`${(e/1e6).toFixed(2)}M`;case"currency":return`$${e.toFixed(2)}`;case"index":return e.toFixed(1);default:return e.toFixed(1)}}function Tt(e,t){return t==="millions"&&e>=1e6?e.toFixed(0):e.toFixed(2)}function Rt(e){switch(e){case"millions":return 1e5;case"percent":return .1;case"currency":return .01;default:return .1}}function Lt(){const e=document.getElementById("realMetricsSourcesTable");if(!e||typeof realMetricsSystem>"u")return;const t=realMetricsSystem.getDataSources();let n="";t.forEach(a=>{n+=`
            <tr>
                <td><strong>${a.name}</strong></td>
                <td>${a.type}</td>
                <td>${a.metrics.join(", ")}</td>
                <td>${a.updateFrequency}</td>
                <td><a href="${a.url}" target="_blank" style="color: var(--primary);">View</a></td>
            </tr>
        `}),e.innerHTML=n}function we(){jt(),Pt(),Dt()}function Dt(){const e=document.getElementById("geminiCounterEnabled");e&&typeof aiSummaryService<"u"&&(e.checked=aiSummaryService.isCounterEnabled()),de(),window.addEventListener("geminiApiCallUpdated",de)}function de(){if(typeof aiSummaryService>"u")return;const e=aiSummaryService.getApiCallStats(),t=document.getElementById("geminiCallsTotal"),n=document.getElementById("geminiCallsToday"),a=document.getElementById("geminiCallsWeek"),o=document.getElementById("geminiLastCall");if(t&&(t.textContent=e.total.toLocaleString()),n&&(n.textContent=e.today.toLocaleString()),a&&(a.textContent=e.thisWeek.toLocaleString()),o)if(e.lastCall){const r=new Date(e.lastCall.timestamp),l=Ft(r);o.textContent=`Last call: ${l} (${e.lastCall.type})`}else o.textContent="No calls recorded"}function Ft(e){const t=Math.floor((new Date-e)/1e3);return t<60?"just now":t<3600?`${Math.floor(t/60)}m ago`:t<86400?`${Math.floor(t/3600)}h ago`:t<604800?`${Math.floor(t/86400)}d ago`:e.toLocaleDateString()}function Pt(){const e=document.getElementById("autoDataStatus");if(!e||!_)return;const t=_.getLiveDataStatus();if(t.available&&t.sources.bls==="success"){const a=new Date(t.lastUpdated).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"});e.innerHTML=`
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="color: var(--secondary); font-size: 1.25rem;">&#10003;</span>
                <strong style="color: var(--secondary);">Live Data Active</strong>
            </div>
            <p style="color: var(--gray-600); font-size: 0.875rem; margin-bottom: 8px;">
                Data automatically updated: <strong>${a}</strong>
            </p>
            <div style="display: flex; gap: 16px; flex-wrap: wrap; font-size: 0.8rem; color: var(--gray-600);">
                <span>BLS: <strong style="color: var(--secondary);">${t.sources.bls}</strong></span>
                <span>FRED: <strong style="color: ${t.sources.fred==="success"?"var(--secondary)":"var(--gray-400)"};">${t.sources.fred}</strong></span>
            </div>
            ${t.summary?`
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--gray-200); font-size: 0.8rem;">
                    <strong>Latest Values:</strong>
                    <div style="display: flex; gap: 16px; flex-wrap: wrap; margin-top: 4px; color: var(--gray-600);">
                        ${t.summary.unemployment_rate?`<span>Unemployment: <strong>${t.summary.unemployment_rate}%</strong></span>`:""}
                        ${t.summary.total_employment?`<span>Employment: <strong>${(t.summary.total_employment/1e6).toFixed(1)}M</strong></span>`:""}
                    </div>
                </div>
            `:""}
        `}else e.innerHTML=`
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="color: var(--warning); font-size: 1.25rem;">&#9888;</span>
                <strong style="color: var(--gray-600);">Using Baseline Data</strong>
            </div>
            <p style="color: var(--gray-600); font-size: 0.875rem;">
                Currently using cached baseline data from late 2024.
            </p>
            <p style="color: var(--gray-500); font-size: 0.75rem; margin-top: 8px;">
                Auto-updated data will be available once the repository owner configures the GitHub Actions workflow with API keys.
            </p>
        `}function jt(){be()}function Ht(e,t){}function Ut(){}function Nt(){confirm(`Reset everything to defaults? This will:

• Reset all simulation parameters
• Reset all economic metrics to baseline
• Reset all AI indicators
• Clear all interventions
• Clear comparison scenarios

Saved simulations will be preserved.`)&&(X(),typeof realMetricsSystem<"u"&&(realMetricsSystem.resetAllMetrics(),ne()),typeof hypotheticalIndicators<"u"&&(hypotheticalIndicators.resetAllIndicators(),B()),activeInterventions=[],M(),typeof scenarioComparison<"u"&&(scenarioComparison.clearAll(),Y()),updateSnapshot(),alert("Everything has been reset to defaults."))}function Ot(){if(!confirm("Reset all metrics to baseline values? This will undo any live data updates or manual adjustments."))return;typeof realMetricsSystem<"u"&&(realMetricsSystem.resetAllMetrics(),ne()),typeof hypotheticalIndicators<"u"&&(hypotheticalIndicators.resetAllIndicators(),B());const e=document.getElementById("fetchResults");e&&(e.innerHTML=`
            <div style="background: var(--secondary); color: white; padding: 12px; border-radius: 6px;">
                Metrics reset to baseline values.
            </div>
        `)}async function Wt(){if(!p){alert("Please run a simulation first before sharing.");return}const e=prompt("Enter a name for your shared simulation:",p.scenario.name||"My Simulation");if(!e)return;const t=prompt("Add a description (optional):",""),n=document.getElementById("shareBtn"),a=n.textContent;n.textContent="Sharing...",n.disabled=!0;try{const o=await simulationSharing.savePublic({name:e,description:t,scenario:p.scenario,results:p.results,summary:p.summary});await simulationSharing.copyShareUrl(o.id),alert(`Simulation shared successfully!

Share URL (copied to clipboard):
${o.url}

This link will expire in ${o.expiresIn}.`)}catch(o){console.error("Share error:",o),alert(`Failed to share simulation: ${o.message}`)}finally{n.textContent=a,n.disabled=!1}}async function Vt(){var t,n,a,o,r,l,i;if(typeof urlSharing<"u"&&urlSharing.hasScenarioInURL())try{applyScenarioFromURL(),updateSlidersFromInputs();return}catch(s){console.warn("Failed to load URL parameters:",s)}if(typeof simulationSharing>"u")return;const e=simulationSharing.getSharedIdFromUrl();if(e){console.log("Loading shared simulation:",e);try{const s=await simulationSharing.load(e),c=document.createElement("div");c.style.cssText=`
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--primary);
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `,c.innerHTML=`
            <strong>Viewing shared simulation:</strong> ${L(s.name)}
            <br><small>Shared ${new Date(s.createdAt).toLocaleDateString()} • ${s.views} views</small>
        `,document.body.appendChild(c),setTimeout(()=>c.remove(),5e3),s.scenario&&(document.getElementById("scenarioName").value=s.name||s.scenario.name,document.getElementById("targetYear").value=((t=s.scenario.timeframe)==null?void 0:t.end_year)||"2029",document.getElementById("targetUR").value=((n=s.scenario.targets)==null?void 0:n.unemployment_rate)||10,document.getElementById("urValue").textContent=((a=s.scenario.targets)==null?void 0:a.unemployment_rate)||10,document.getElementById("aiAdoption").value=((o=s.scenario.targets)==null?void 0:o.ai_adoption_rate)||70,document.getElementById("aiValue").textContent=((r=s.scenario.targets)==null?void 0:r.ai_adoption_rate)||70,document.getElementById("automationPace").value=((l=s.scenario.targets)==null?void 0:l.automation_pace)||"moderate",document.getElementById("adoptionCurve").value=((i=s.scenario.ai_parameters)==null?void 0:i.adoption_curve)||"s_curve"),p={scenario:s.scenario,results:s.results,summary:s.summary},D(p),document.getElementById("shareBtn").style.display="inline-block",document.querySelectorAll(".section").forEach(d=>d.classList.remove("active")),document.getElementById("simulation-section").classList.add("active"),document.querySelectorAll(".nav-tab").forEach(d=>d.classList.remove("active")),document.querySelectorAll(".nav-tab")[3].classList.add("active"),window.history.replaceState({},document.title,window.location.pathname)}catch(s){console.error("Failed to load shared simulation:",s),alert(`Failed to load shared simulation: ${s.message}`),window.history.replaceState({},document.title,window.location.pathname)}}}function ae(){const e=document.getElementById("shareBtn");e&&typeof simulationSharing<"u"&&simulationSharing.isAvailable()&&(e.style.display="inline-block")}let j=null;async function Yt(){var n,a;if(!p||!h){alert("Please run a simulation first");return}const e=document.getElementById("runMonteCarloBtn"),t=document.getElementById("monteCarloContent");e.disabled=!0,e.innerHTML="Running... 0%",t.innerHTML=`
        <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Running 1000 iterations...</span>
                <span id="mcProgress">0%</span>
            </div>
            <div class="progress-bar" style="height: 12px;">
                <div class="fill" id="mcProgressBar" style="width: 0%;"></div>
            </div>
        </div>
        <p style="color: var(--gray-500); font-size: 0.875rem;">
            This may take 30-60 seconds. Each iteration randomizes parameters within realistic ranges.
        </p>
    `;try{j=new MonteCarloSimulation(h),j.configure({iterations:1e3});const o={name:p.scenario.name,end_year:p.scenario.timeframe.end_year,target_unemployment:p.scenario.targets.unemployment_rate,ai_adoption_rate:p.scenario.targets.ai_adoption_rate,automation_pace:p.scenario.targets.automation_pace,adoption_curve:p.scenario.ai_parameters.adoption_curve,new_job_multiplier:p.scenario.ai_parameters.new_job_multiplier||.4,gdp_growth:((n=p.scenario.economic_parameters)==null?void 0:n.gdp_growth)||2.5,labor_elasticity:((a=p.scenario.economic_parameters)==null?void 0:a.labor_elasticity)||.7},r=await j.run(o,l=>{const i=document.getElementById("mcProgress"),s=document.getElementById("mcProgressBar");i&&(i.textContent=`${Math.round(l)}%`),s&&(s.style.width=`${l}%`),e.innerHTML=`Running... ${Math.round(l)}%`});Jt(r),e.innerHTML="Run Again",e.disabled=!1}catch(o){console.error("Monte Carlo error:",o),t.innerHTML=`
            <div style="color: var(--danger);">
                <p><strong>Error running Monte Carlo analysis:</strong></p>
                <p>${o.message}</p>
            </div>
        `,e.innerHTML="Run 1000 Iterations",e.disabled=!1}}function Jt(e){const t=document.getElementById("monteCarloContent"),n=e.distributions,a=(r,l=1)=>Math.abs(r)>=1e6?(r/1e6).toFixed(l)+"M":Math.abs(r)>=1e3?(r/1e3).toFixed(l)+"K":r.toFixed(l),o=j.generateReport();t.innerHTML=`
        <div style="margin-bottom: 24px;">
            <h4 style="margin-bottom: 12px; color: var(--gray-700);">Probability Distribution Summary</h4>
            <p style="color: var(--gray-500); font-size: 0.875rem; margin-bottom: 16px;">
                Based on ${e.iterations} simulations with randomized parameters
            </p>

            <!-- Key Metrics Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
                <!-- Unemployment -->
                <div style="background: var(--gray-50); padding: 16px; border-radius: 8px;">
                    <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase; margin-bottom: 4px;">
                        Final Unemployment Rate
                    </div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--gray-900);">
                        ${n.final_unemployment.median.toFixed(1)}%
                    </div>
                    <div style="font-size: 0.875rem; color: var(--gray-600);">
                        90% CI: ${n.final_unemployment.p5.toFixed(1)}% - ${n.final_unemployment.p95.toFixed(1)}%
                    </div>
                    <div style="font-size: 0.75rem; color: var(--warning); margin-top: 4px;">
                        ${(o.unemployment.probability_above_10*100).toFixed(0)}% chance above 10%
                    </div>
                </div>

                <!-- Net Job Change -->
                <div style="background: var(--gray-50); padding: 16px; border-radius: 8px;">
                    <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase; margin-bottom: 4px;">
                        Net Job Change
                    </div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: ${n.net_job_change.median>=0?"var(--secondary)":"var(--danger)"};">
                        ${n.net_job_change.median>=0?"+":""}${a(n.net_job_change.median)}
                    </div>
                    <div style="font-size: 0.875rem; color: var(--gray-600);">
                        Range: ${a(n.net_job_change.p10)} to ${a(n.net_job_change.p90)}
                    </div>
                    <div style="font-size: 0.75rem; color: var(--secondary); margin-top: 4px;">
                        ${(o.netJobChange.probability_positive*100).toFixed(0)}% chance positive
                    </div>
                </div>

                <!-- Jobs Displaced -->
                <div style="background: var(--gray-50); padding: 16px; border-radius: 8px;">
                    <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase; margin-bottom: 4px;">
                        Jobs Displaced
                    </div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--danger);">
                        ${a(n.cumulative_displacement.median)}
                    </div>
                    <div style="font-size: 0.875rem; color: var(--gray-600);">
                        90% CI: ${a(n.cumulative_displacement.p5)} - ${a(n.cumulative_displacement.p95)}
                    </div>
                </div>

                <!-- New Jobs Created -->
                <div style="background: var(--gray-50); padding: 16px; border-radius: 8px;">
                    <div style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase; margin-bottom: 4px;">
                        New Jobs Created
                    </div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--secondary);">
                        ${a(n.cumulative_new_jobs.median)}
                    </div>
                    <div style="font-size: 0.875rem; color: var(--gray-600);">
                        90% CI: ${a(n.cumulative_new_jobs.p5)} - ${a(n.cumulative_new_jobs.p95)}
                    </div>
                </div>
            </div>

            <!-- Distribution Charts -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
                <div>
                    <h5 style="margin-bottom: 8px; font-size: 0.875rem; color: var(--gray-700);">
                        Unemployment Distribution
                    </h5>
                    <div class="chart-container small">
                        <canvas id="mcUnemploymentHist"></canvas>
                    </div>
                </div>
                <div>
                    <h5 style="margin-bottom: 8px; font-size: 0.875rem; color: var(--gray-700);">
                        Net Job Change Distribution
                    </h5>
                    <div class="chart-container small">
                        <canvas id="mcJobChangeHist"></canvas>
                    </div>
                </div>
            </div>

            <!-- Confidence Intervals Table -->
            <div style="margin-top: 24px;">
                <h5 style="margin-bottom: 12px; font-size: 0.875rem; color: var(--gray-700);">
                    Confidence Intervals
                </h5>
                <table class="data-table" style="font-size: 0.875rem;">
                    <thead>
                        <tr>
                            <th>Metric</th>
                            <th>5th %ile</th>
                            <th>25th %ile</th>
                            <th>Median</th>
                            <th>75th %ile</th>
                            <th>95th %ile</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Unemployment Rate</td>
                            <td>${n.final_unemployment.p5.toFixed(1)}%</td>
                            <td>${n.final_unemployment.p25.toFixed(1)}%</td>
                            <td><strong>${n.final_unemployment.median.toFixed(1)}%</strong></td>
                            <td>${n.final_unemployment.p75.toFixed(1)}%</td>
                            <td>${n.final_unemployment.p95.toFixed(1)}%</td>
                        </tr>
                        <tr>
                            <td>Jobs Displaced</td>
                            <td>${a(n.cumulative_displacement.p5)}</td>
                            <td>${a(n.cumulative_displacement.p25)}</td>
                            <td><strong>${a(n.cumulative_displacement.median)}</strong></td>
                            <td>${a(n.cumulative_displacement.p75)}</td>
                            <td>${a(n.cumulative_displacement.p95)}</td>
                        </tr>
                        <tr>
                            <td>New Jobs Created</td>
                            <td>${a(n.cumulative_new_jobs.p5)}</td>
                            <td>${a(n.cumulative_new_jobs.p25)}</td>
                            <td><strong>${a(n.cumulative_new_jobs.median)}</strong></td>
                            <td>${a(n.cumulative_new_jobs.p75)}</td>
                            <td>${a(n.cumulative_new_jobs.p95)}</td>
                        </tr>
                        <tr>
                            <td>Net Job Change</td>
                            <td>${a(n.net_job_change.p5)}</td>
                            <td>${a(n.net_job_change.p25)}</td>
                            <td><strong>${a(n.net_job_change.median)}</strong></td>
                            <td>${a(n.net_job_change.p75)}</td>
                            <td>${a(n.net_job_change.p95)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `,setTimeout(()=>{ce("mcUnemploymentHist",n.final_unemployment,"Unemployment Rate (%)","var(--danger)"),ce("mcJobChangeHist",n.net_job_change,"Net Job Change","var(--info)",!0)},100)}function ce(e,t,n,a,o=!1){const r=document.getElementById(e);if(!r)return;const l=t.histogram,i=l.map(s=>{if(o){const c=s.binMid;return Math.abs(c)>=1e6?(c/1e6).toFixed(1)+"M":Math.abs(c)>=1e3?(c/1e3).toFixed(0)+"K":c.toFixed(0)}return s.binMid.toFixed(1)});new Chart(r,{type:"bar",data:{labels:i,datasets:[{label:"Frequency",data:l.map(s=>s.frequency*100),backgroundColor:a,borderColor:a,borderWidth:1}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},tooltip:{callbacks:{label:s=>`${s.parsed.y.toFixed(1)}% of simulations`}}},scales:{x:{title:{display:!0,text:n}},y:{title:{display:!0,text:"Probability (%)"},beginAtZero:!0}}}})}function Gt(){const e=document.getElementById("sidebar"),t=document.getElementById("sidebarOverlay");e&&e.classList.add("open"),t&&t.classList.add("active"),document.body.style.overflow="hidden"}function Ie(){const e=document.getElementById("sidebar"),t=document.getElementById("sidebarOverlay");e&&e.classList.remove("open"),t&&t.classList.remove("active"),document.body.style.overflow=""}document.addEventListener("keydown",e=>{e.key==="Escape"&&Ie()});function qt(){const e=document.getElementById("historyModal");e.style.display="flex",ie()}function _e(){document.getElementById("historyModal").style.display="none"}function ie(){const e=document.getElementById("historyList"),t=simulationHistory.getAll();if(t.length===0){e.innerHTML=`
            <div style="text-align: center; padding: 40px; color: var(--text-muted, var(--gray-500));">
                <p style="font-size: 2rem; margin-bottom: 8px;">📭</p>
                <p>No simulation history yet.</p>
                <p style="font-size: 0.875rem;">Run a simulation to start building your history.</p>
            </div>
        `;return}e.innerHTML=t.map(n=>{var a;return`
        <div class="history-item" style="background: var(--gray-50, #f9fafb); border-radius: 8px; padding: 16px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s; border: 1px solid transparent;"
             onmouseover="this.style.borderColor='var(--primary)'"
             onmouseout="this.style.borderColor='transparent'"
             onclick="loadFromHistory(${n.id})">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                <div>
                    <h4 style="font-size: 1rem; font-weight: 600; color: var(--text-primary, var(--gray-800)); margin-bottom: 4px;">
                        ${L(n.name)}
                    </h4>
                    <span style="font-size: 0.75rem; color: var(--text-muted, var(--gray-500));">
                        ${simulationHistory.formatTimestamp(n.timestamp)}
                    </span>
                </div>
                <button onclick="event.stopPropagation(); deleteFromHistory(${n.id})"
                        style="background: none; border: none; color: var(--danger); cursor: pointer; padding: 4px;"
                        title="Delete this simulation">
                    🗑️
                </button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; font-size: 0.875rem;">
                <div>
                    <div style="color: var(--text-muted, var(--gray-500)); font-size: 0.7rem; text-transform: uppercase;">Timeframe</div>
                    <div style="font-weight: 500; color: var(--text-secondary, var(--gray-700));">${n.summary.timeframe}</div>
                </div>
                <div>
                    <div style="color: var(--text-muted, var(--gray-500)); font-size: 0.7rem; text-transform: uppercase;">Final Unemp.</div>
                    <div style="font-weight: 500; color: var(--danger);">${((a=n.summary.finalUnemployment)==null?void 0:a.toFixed(1))||"N/A"}%</div>
                </div>
                <div>
                    <div style="color: var(--text-muted, var(--gray-500)); font-size: 0.7rem; text-transform: uppercase;">Jobs Lost</div>
                    <div style="font-weight: 500; color: var(--danger);">${simulationHistory.formatNumber(n.summary.jobsDisplaced)}</div>
                </div>
                <div>
                    <div style="color: var(--text-muted, var(--gray-500)); font-size: 0.7rem; text-transform: uppercase;">Jobs Created</div>
                    <div style="font-weight: 500; color: var(--secondary);">${simulationHistory.formatNumber(n.summary.jobsCreated)}</div>
                </div>
            </div>
            <div style="margin-top: 8px; font-size: 0.75rem; color: var(--text-muted, var(--gray-500));">
                ${n.summary.adoptionCurve.replace("_","-")} curve • ${n.summary.aiAdoption}% AI adoption • ${n.summary.interventions} intervention${n.summary.interventions!==1?"s":""}
            </div>
        </div>
    `}).join("")}function Kt(e){var n,a,o,r,l;const t=simulationHistory.get(e);if(!t){alert("Simulation not found in history");return}if(p={scenario:t.scenario,results:t.results,summary:t.summaryData},t.scenario){const i=document.getElementById("endYear"),s=document.getElementById("targetUR"),c=document.getElementById("aiAdoptionRate"),d=document.getElementById("automationPace"),m=document.getElementById("adoptionCurve");i&&(i.value=((n=t.scenario.timeframe)==null?void 0:n.end_year)||2030),s&&(s.value=((a=t.scenario.targets)==null?void 0:a.unemployment_rate)||10),c&&(c.value=((o=t.scenario.targets)==null?void 0:o.ai_adoption_rate)||50),d&&(d.value=((r=t.scenario.targets)==null?void 0:r.automation_pace)||"moderate"),m&&(m.value=((l=t.scenario.ai_parameters)==null?void 0:l.adoption_curve)||"s_curve")}D(p),ae(),document.querySelectorAll(".section").forEach(i=>i.classList.remove("active")),document.getElementById("simulation-section").classList.add("active"),document.querySelectorAll(".nav-tab").forEach(i=>i.classList.remove("active")),document.querySelectorAll(".nav-tab")[3].classList.add("active"),_e()}function Zt(e){confirm("Delete this simulation from history?")&&(simulationHistory.delete(e),ie())}function Xt(){confirm("Clear all simulation history? This cannot be undone.")&&(simulationHistory.clearAll(),ie())}function Qt(){const t=document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark";document.documentElement.setAttribute("data-theme",t),localStorage.setItem("theme",t),$e(t),Ee(t)}function $e(e){const t=document.getElementById("themeIcon");t&&(t.textContent=e==="dark"?"☀️":"🌙")}function Ee(e){const t=e==="dark",n=t?"#f1f5f9":"#374151",a=t?"#334155":"#e5e7eb";Chart.defaults.color=n,Chart.defaults.borderColor=a,Chart.helpers.each(Chart.instances,o=>{o.options.scales&&Object.keys(o.options.scales).forEach(r=>{o.options.scales[r].grid&&(o.options.scales[r].grid.color=a),o.options.scales[r].ticks&&(o.options.scales[r].ticks.color=n)}),o.options.plugins&&o.options.plugins.legend&&(o.options.plugins.legend.labels=o.options.plugins.legend.labels||{},o.options.plugins.legend.labels.color=n),o.update()})}function en(){const e=localStorage.getItem("theme"),t=window.matchMedia("(prefers-color-scheme: dark)").matches,n=e||(t?"dark":"light");document.documentElement.setAttribute("data-theme",n),$e(n),Ee(n)}function b(e,t="info"){const n={success:"var(--secondary)",warning:"var(--warning)",error:"var(--danger)",info:"var(--primary)"},a=t==="error"||t==="warning",o=a?0:4e3,r=document.createElement("div");r.style.cssText=`
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${n[t]||n.info};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-weight: 500;
        animation: fadeIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 90vw;
    `;const l=document.createElement("span");if(l.textContent=e,l.style.flex="1",r.appendChild(l),a){const i=document.createElement("button");i.innerHTML="&times;",i.style.cssText=`
            background: transparent;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0 4px;
            line-height: 1;
            opacity: 0.8;
        `,i.onclick=()=>{r.style.animation="fadeOut 0.3s ease forwards",setTimeout(()=>r.remove(),300)},i.onmouseover=()=>i.style.opacity="1",i.onmouseout=()=>i.style.opacity="0.8",r.appendChild(i)}document.body.appendChild(r),o>0&&setTimeout(()=>{r.style.animation="fadeOut 0.3s ease forwards",setTimeout(()=>r.remove(),300)},o)}const Ce="ai2025",k=1e3,J="ai_labor_sim_ai_usage_count",N="ai_labor_sim_limit_alert_sent";function R(){const e=localStorage.getItem(J);return e?parseInt(e,10):0}function tn(){const t=R()+1;return localStorage.setItem(J,t.toString()),t}function Se(){return R()>=k}async function Ae(){if(localStorage.getItem(N))return;const e=R(),t={event:"AI_USAGE_LIMIT_REACHED",count:e,limit:k,timestamp:new Date().toISOString(),url:window.location.href};console.log("AI Usage Limit Alert:",t);try{const n=encodeURIComponent("AI Labor Simulator - Usage Limit Reached"),a=encodeURIComponent(`AI Usage Limit Alert

The AI Labor Market Simulator has reached ${e} uses.
Limit: ${k}
Timestamp: ${t.timestamp}

Password protection is now enabled.
Default password: ${Ce}`);b(`AI usage limit (${k}) reached! Password protection now enabled.`,"warning"),localStorage.setItem(N,"true"),console.warn(`[ALERT] AI Simulation usage limit reached: ${e}/${k}`)}catch(n){console.error("Failed to send usage limit alert:",n)}}function oe(){return{currentCount:R(),limit:k,remaining:Math.max(0,k-R()),limitReached:Se(),alertSent:localStorage.getItem(N)==="true"}}function nn(){return localStorage.removeItem(J),localStorage.removeItem(N),console.log("AI usage counter reset to 0"),oe()}function an(e){return localStorage.setItem(J,e.toString()),console.log(`AI usage counter set to ${e}`),oe()}window.getAIUsageStats=oe;window.resetAIUsageCount=nn;window.setAIUsageCount=an;function on(){Se()?(Ae(),aiScenarioEnhancer.hasPassword()||aiScenarioEnhancer.setPassword(Ce),ke()):Be()}function ke(){document.getElementById("passwordModal").style.display="flex",document.getElementById("aiSimPassword").value="",document.getElementById("passwordError").style.display="none",document.getElementById("aiSimPassword").focus()}function re(){document.getElementById("passwordModal").style.display="none"}async function Me(){const e=document.getElementById("aiSimPassword").value;if(!aiScenarioEnhancer.checkPassword(e)){document.getElementById("passwordError").style.display="block";return}re(),await Be()}async function Be(){if(!aiScenarioEnhancer.isAvailable()){alert("AI service not available. Please check your API configuration.");return}const e=document.getElementById("simulation-results");e.innerHTML=`
        <div class="card" style="text-align: center; padding: 60px;">
            <div class="loading-spinner" style="margin-bottom: 20px;">
                <div style="width: 50px; height: 50px; border: 4px solid var(--gray-200); border-top-color: var(--primary); border-radius: 50%; margin: 0 auto; animation: spin 1s linear infinite;"></div>
            </div>
            <h3 style="margin-bottom: 16px;">Running AI-Enhanced Simulation</h3>
            <p style="color: var(--gray-500);" id="aiSimStatus">Step 1/3: Enhancing inputs with AI...</p>
        </div>
    `,document.querySelectorAll(".section").forEach(n=>n.classList.remove("active")),document.getElementById("simulation-section").classList.add("active"),document.querySelectorAll(".nav-tab").forEach(n=>n.classList.remove("active")),document.querySelectorAll(".nav-tab")[3].classList.add("active");const t={targetUnemployment:parseFloat(document.getElementById("targetUR").value),aiAdoption:parseInt(document.getElementById("aiAdoption").value),automationPace:document.getElementById("automationPace").value,adoptionCurve:document.getElementById("adoptionCurve").value,startYear:new Date().getFullYear(),endYear:parseInt(document.getElementById("targetYear").value),years:parseInt(document.getElementById("targetYear").value)-new Date().getFullYear(),interventions:v.interventions.filter(n=>n.active)};try{q("Step 1/3: Enhancing inputs with AI...");const n=await aiScenarioEnhancer.enhanceInputs(t);console.log("Enhanced params:",n),q("Step 2/3: Running enhanced simulation...");const a=rn(t,n);h.createScenario(a);const o=await h.runSimulation();p=o,q("Step 3/3: Generating AI analysis...");const r=await aiScenarioEnhancer.analyzeResults(t,n,o);console.log("AI Analysis:",r);const l=aiScenarioEnhancer.storeSimulation({inputs:t,enhancedParams:n,results:o,analysis:r});console.log("Stored simulation ID:",l),A={analysis:r,enhancedParams:n,timestamp:new Date().toISOString()},U=!0,D(o),se();const i=tn();console.log(`AI Simulation usage: ${i}/${k}`),i===k&&Ae(),b("AI-enhanced simulation complete!","success")}catch(n){console.error("AI Simulation error:",n),e.innerHTML=`
            <div class="card" style="text-align: center; padding: 60px;">
                <h3 style="margin-bottom: 16px; color: var(--danger);">AI Simulation Failed</h3>
                <p style="color: var(--gray-500); margin-bottom: 24px;">${n.message}</p>
                <button class="btn btn-primary" onclick="runSimulation()">Run Standard Simulation</button>
            </div>
        `}}function q(e){const t=document.getElementById("aiSimStatus");t&&(t.textContent=e)}function rn(e,t){var a,o;return{name:document.getElementById("scenarioName").value+" (AI Enhanced)",end_year:e.endYear,target_unemployment:e.targetUnemployment,ai_adoption_rate:e.aiAdoption,automation_pace:e.automationPace,adoption_curve:e.adoptionCurve,ai_enhanced:!0,enhanced_params:t,new_job_multiplier:((a=t.job_creation_coefficients)==null?void 0:a.base_multiplier)||.3,displacement_lag:((o=t.transition_dynamics)==null?void 0:o.displacement_lag_months)||6}}function sn(e,t){var n,a,o,r,l,i,s,c,d;return`
        <div class="ai-analysis-inline">
            <!-- Executive Summary -->
            <div class="analysis-section" style="margin-bottom: 24px;">
                <h4 style="color: var(--primary); margin-bottom: 12px;">Executive Summary</h4>
                <p style="font-size: 1rem; line-height: 1.6;">${e.executive_summary||"Analysis in progress..."}</p>
            </div>

            <!-- Key Findings -->
            <div class="analysis-section" style="margin-bottom: 24px;">
                <h4 style="color: var(--primary); margin-bottom: 12px;">Key Findings</h4>
                <div class="ai-findings-grid">
                    ${(e.key_findings||[]).map(m=>`
                        <div class="ai-finding-card" style="border-left-color: ${m.impact==="high"?"var(--danger)":m.impact==="medium"?"var(--warning)":"var(--secondary)"};">
                            <p style="margin: 0; font-weight: 500;">${m.finding}</p>
                            <div class="ai-finding-meta">
                                <span>Confidence: <strong>${m.confidence}</strong></span>
                                <span>Impact: <strong>${m.impact}</strong></span>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>

            <!-- Workforce Impacts -->
            <div class="analysis-section" style="margin-bottom: 24px;">
                <h4 style="color: var(--primary); margin-bottom: 12px;">Workforce Impacts</h4>
                <div class="ai-workforce-grid">
                    <div class="ai-workforce-card">
                        <h5 style="color: var(--danger); font-size: 0.875rem; margin-bottom: 8px;">High Risk Workers</h5>
                        <p style="margin: 0; font-size: 0.875rem;">${((n=e.workforce_impacts)==null?void 0:n.high_risk_workers)||"N/A"}</p>
                    </div>
                    <div class="ai-workforce-card">
                        <h5 style="color: var(--secondary); font-size: 0.875rem; margin-bottom: 8px;">Emerging Opportunities</h5>
                        <p style="margin: 0; font-size: 0.875rem;">${((a=e.workforce_impacts)==null?void 0:a.emerging_opportunities)||"N/A"}</p>
                    </div>
                </div>
                ${(o=e.workforce_impacts)!=null&&o.skills_in_demand?`
                    <div style="margin-top: 16px;">
                        <h5 style="font-size: 0.875rem; margin-bottom: 8px;">Skills in Demand</h5>
                        <div class="ai-skills-list">
                            ${e.workforce_impacts.skills_in_demand.map(m=>`<span class="ai-skill-tag">${m}</span>`).join("")}
                        </div>
                    </div>
                `:""}
            </div>

            <!-- Policy Recommendations -->
            <div class="analysis-section" style="margin-bottom: 24px;">
                <h4 style="color: var(--primary); margin-bottom: 12px;">Policy Recommendations</h4>
                <div class="ai-policy-grid">
                    ${(e.policy_recommendations||[]).map(m=>`
                        <div class="ai-policy-card">
                            <div class="ai-policy-priority">
                                <span class="ai-priority-badge" style="background: ${m.priority==="immediate"?"var(--danger)":m.priority==="short-term"?"var(--warning)":"var(--primary)"};">${m.priority}</span>
                            </div>
                            <div class="ai-policy-content">
                                <p style="margin: 0;">${m.policy}</p>
                                <span style="font-size: 0.75rem; color: var(--gray-500);">Effectiveness: ${m.effectiveness}</span>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>

            <!-- Scenario Variations -->
            <div class="analysis-section" style="margin-bottom: 24px;">
                <h4 style="color: var(--primary); margin-bottom: 12px;">Scenario Variations</h4>
                <div class="ai-scenarios-grid">
                    <div class="ai-scenario-card ai-scenario-optimistic">
                        <h5>Optimistic</h5>
                        <p style="margin: 0; font-size: 0.875rem;">${((r=e.scenario_variations)==null?void 0:r.optimistic_case)||"N/A"}</p>
                    </div>
                    <div class="ai-scenario-card ai-scenario-likely">
                        <h5>Most Likely</h5>
                        <p style="margin: 0; font-size: 0.875rem;">${((l=e.scenario_variations)==null?void 0:l.most_likely)||"N/A"}</p>
                    </div>
                    <div class="ai-scenario-card ai-scenario-pessimistic">
                        <h5>Pessimistic</h5>
                        <p style="margin: 0; font-size: 0.875rem;">${((i=e.scenario_variations)==null?void 0:i.pessimistic_case)||"N/A"}</p>
                    </div>
                </div>
            </div>

            <!-- Narrative Analysis -->
            ${e.narrative_analysis?`
                <div class="analysis-section" style="margin-bottom: 24px;">
                    <h4 style="color: var(--primary); margin-bottom: 12px;">Detailed Analysis</h4>
                    <div class="ai-narrative-box">
                        ${e.narrative_analysis.split(`
`).map(m=>`<p style="margin-bottom: 12px;">${m}</p>`).join("")}
                    </div>
                </div>
            `:""}

            <!-- Model Confidence -->
            <div class="analysis-section">
                <div class="ai-confidence-bar">
                    <span style="font-weight: 500;">Model Confidence</span>
                    <span class="ai-confidence-badge" style="background: ${((s=e.model_confidence)==null?void 0:s.overall)==="high"?"var(--secondary)":((c=e.model_confidence)==null?void 0:c.overall)==="medium"?"var(--warning)":"var(--danger)"};">${((d=e.model_confidence)==null?void 0:d.overall)||"Unknown"}</span>
                </div>
            </div>
        </div>
    `}function ln(e,t){var o,r,l,i,s,c,d,m,u;A={analysis:e,enhancedParams:t,timestamp:new Date().toISOString()};const n=document.getElementById("aiResultsModal"),a=document.getElementById("aiResultsContent");a.innerHTML=`
        <div class="ai-analysis">
            <!-- Executive Summary -->
            <div class="analysis-section" style="margin-bottom: 24px;">
                <h4 style="color: var(--primary); margin-bottom: 12px;">Executive Summary</h4>
                <p style="font-size: 1rem; line-height: 1.6;">${e.executive_summary||"Analysis in progress..."}</p>
            </div>

            <!-- Key Findings -->
            <div class="analysis-section" style="margin-bottom: 24px;">
                <h4 style="color: var(--primary); margin-bottom: 12px;">Key Findings</h4>
                <div style="display: grid; gap: 12px;">
                    ${(e.key_findings||[]).map(g=>`
                        <div style="display: flex; gap: 12px; padding: 12px; background: var(--gray-50); border-radius: 8px; border-left: 4px solid ${g.impact==="high"?"var(--danger)":g.impact==="medium"?"var(--warning)":"var(--secondary)"};">
                            <div style="flex: 1;">
                                <p style="margin: 0; font-weight: 500;">${g.finding}</p>
                                <div style="display: flex; gap: 12px; margin-top: 8px; font-size: 0.75rem;">
                                    <span style="color: var(--gray-500);">Confidence: <strong>${g.confidence}</strong></span>
                                    <span style="color: var(--gray-500);">Impact: <strong>${g.impact}</strong></span>
                                </div>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>

            <!-- Workforce Impacts -->
            <div class="analysis-section" style="margin-bottom: 24px;">
                <h4 style="color: var(--primary); margin-bottom: 12px;">Workforce Impacts</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                    <div style="padding: 16px; background: var(--gray-50); border-radius: 8px;">
                        <h5 style="color: var(--danger); font-size: 0.875rem; margin-bottom: 8px;">High Risk Workers</h5>
                        <p style="margin: 0; font-size: 0.875rem;">${((o=e.workforce_impacts)==null?void 0:o.high_risk_workers)||"N/A"}</p>
                    </div>
                    <div style="padding: 16px; background: var(--gray-50); border-radius: 8px;">
                        <h5 style="color: var(--secondary); font-size: 0.875rem; margin-bottom: 8px;">Emerging Opportunities</h5>
                        <p style="margin: 0; font-size: 0.875rem;">${((r=e.workforce_impacts)==null?void 0:r.emerging_opportunities)||"N/A"}</p>
                    </div>
                </div>
                ${(l=e.workforce_impacts)!=null&&l.skills_in_demand?`
                    <div style="margin-top: 16px;">
                        <h5 style="font-size: 0.875rem; margin-bottom: 8px;">Skills in Demand</h5>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                            ${e.workforce_impacts.skills_in_demand.map(g=>`<span style="padding: 4px 12px; background: var(--secondary); color: white; border-radius: 16px; font-size: 0.75rem;">${g}</span>`).join("")}
                        </div>
                    </div>
                `:""}
            </div>

            <!-- Policy Recommendations -->
            <div class="analysis-section" style="margin-bottom: 24px;">
                <h4 style="color: var(--primary); margin-bottom: 12px;">Policy Recommendations</h4>
                <div style="display: grid; gap: 12px;">
                    ${(e.policy_recommendations||[]).map(g=>`
                        <div style="display: flex; gap: 12px; padding: 12px; background: var(--gray-50); border-radius: 8px;">
                            <div style="width: 80px; text-align: center;">
                                <span style="display: inline-block; padding: 4px 8px; background: ${g.priority==="immediate"?"var(--danger)":g.priority==="short-term"?"var(--warning)":"var(--primary)"}; color: white; border-radius: 4px; font-size: 0.625rem; text-transform: uppercase;">${g.priority}</span>
                            </div>
                            <div style="flex: 1;">
                                <p style="margin: 0;">${g.policy}</p>
                                <span style="font-size: 0.75rem; color: var(--gray-500);">Effectiveness: ${g.effectiveness}</span>
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>

            <!-- Scenario Variations -->
            <div class="analysis-section" style="margin-bottom: 24px;">
                <h4 style="color: var(--primary); margin-bottom: 12px;">Scenario Variations</h4>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                    <div style="padding: 16px; background: #ecfdf5; border-radius: 8px; border-left: 4px solid var(--secondary);">
                        <h5 style="color: var(--secondary); font-size: 0.75rem; text-transform: uppercase; margin-bottom: 8px;">Optimistic</h5>
                        <p style="margin: 0; font-size: 0.875rem;">${((i=e.scenario_variations)==null?void 0:i.optimistic_case)||"N/A"}</p>
                    </div>
                    <div style="padding: 16px; background: #fef3c7; border-radius: 8px; border-left: 4px solid var(--warning);">
                        <h5 style="color: var(--warning); font-size: 0.75rem; text-transform: uppercase; margin-bottom: 8px;">Most Likely</h5>
                        <p style="margin: 0; font-size: 0.875rem;">${((s=e.scenario_variations)==null?void 0:s.most_likely)||"N/A"}</p>
                    </div>
                    <div style="padding: 16px; background: #fef2f2; border-radius: 8px; border-left: 4px solid var(--danger);">
                        <h5 style="color: var(--danger); font-size: 0.75rem; text-transform: uppercase; margin-bottom: 8px;">Pessimistic</h5>
                        <p style="margin: 0; font-size: 0.875rem;">${((c=e.scenario_variations)==null?void 0:c.pessimistic_case)||"N/A"}</p>
                    </div>
                </div>
            </div>

            <!-- Narrative Analysis -->
            ${e.narrative_analysis?`
                <div class="analysis-section" style="margin-bottom: 24px;">
                    <h4 style="color: var(--primary); margin-bottom: 12px;">Detailed Analysis</h4>
                    <div style="padding: 20px; background: var(--gray-50); border-radius: 8px; line-height: 1.8;">
                        ${e.narrative_analysis.split(`
`).map(g=>`<p style="margin-bottom: 12px;">${g}</p>`).join("")}
                    </div>
                </div>
            `:""}

            <!-- Model Confidence -->
            <div class="analysis-section">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--gray-100); border-radius: 8px;">
                    <span style="font-weight: 500;">Model Confidence</span>
                    <span style="padding: 6px 16px; background: ${((d=e.model_confidence)==null?void 0:d.overall)==="high"?"var(--secondary)":((m=e.model_confidence)==null?void 0:m.overall)==="medium"?"var(--warning)":"var(--danger)"}; color: white; border-radius: 16px; font-weight: bold; text-transform: uppercase;">${((u=e.model_confidence)==null?void 0:u.overall)||"Unknown"}</span>
                </div>
            </div>
        </div>
    `,n.style.display="flex"}function ze(){document.getElementById("aiResultsModal").style.display="none"}function dn(){if(!A){b("No AI analysis available. Run an Advanced AI Simulation first.","warning");return}ln(A.analysis,A.enhancedParams)}function cn(){const e=document.getElementById("trainingModal");Re(),e.style.display="flex"}function Te(){document.getElementById("trainingModal").style.display="none"}function Re(){const e=modelTrainer.getStatus();document.getElementById("trainSimCount").textContent=e.storedSimulations,document.getElementById("trainModelVersion").textContent=e.modelVersion,document.getElementById("trainConfidence").textContent=e.confidence?(e.confidence*100).toFixed(0)+"%":"-";const t=document.getElementById("trainModelBtn"),n=document.getElementById("trainingMessage");e.readyForTraining?(t.disabled=!1,n.innerHTML=`<span style="color: var(--secondary);">Ready to train!</span> ${e.storedSimulations} AI simulations available.`):(t.disabled=!0,n.innerHTML=`Run at least 3 AI-enhanced simulations to enable model training. Currently: ${e.storedSimulations}`),e.hasTrainedModel&&(n.innerHTML+=`<br><small style="color: var(--gray-500);">Last trained: ${new Date(e.lastTraining).toLocaleDateString()}</small>`)}async function mn(){const e=document.getElementById("trainModelBtn"),t=document.getElementById("trainingMessage");e.disabled=!0,e.textContent="Training...",t.innerHTML='<span style="color: var(--primary);">Training model with AI... This may take a minute.</span>';try{const n=await modelTrainer.trainModel();n.success?(t.innerHTML=`<span style="color: var(--secondary);">Training complete!</span> Model v${n.model.model_version} with ${(n.model.confidence_score*100).toFixed(0)}% confidence.`,Re(),se(),b("Model trained successfully!","success")):t.innerHTML=`<span style="color: var(--danger);">Training failed:</span> ${n.message}`}catch(n){t.innerHTML=`<span style="color: var(--danger);">Error:</span> ${n.message}`}e.disabled=!1,e.textContent="Train Model"}function pn(){const e=modelTrainer.exportAll(),t=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),n=URL.createObjectURL(t),a=document.createElement("a");a.href=n,a.download=`ai-labor-sim-training-data-${new Date().toISOString().split("T")[0]}.json`,a.click(),URL.revokeObjectURL(n),b("Training data exported!","success")}function se(){const e=document.getElementById("aiModelStatus");if(!e)return;const t=modelTrainer.getStatus();e.innerHTML=`
        <div style="font-size: 0.75rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="color: var(--gray-400);">Simulations:</span>
                <span style="color: var(--text-primary); font-weight: 500;">${t.storedSimulations}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="color: var(--gray-400);">Model:</span>
                <span style="color: var(--text-primary); font-weight: 500;">${t.modelVersion}</span>
            </div>
            ${t.hasTrainedModel?`
                <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--gray-400);">Confidence:</span>
                    <span style="color: ${t.confidence>.7?"var(--secondary)":t.confidence>.4?"var(--warning)":"var(--danger)"}; font-weight: 500;">${(t.confidence*100).toFixed(0)}%</span>
                </div>
            `:""}
        </div>
    `}let O=null,Z=null,T={},S=null;async function Le(){const e={numWorkers:parseInt(document.getElementById("abmWorkers").value),numFirms:parseInt(document.getElementById("abmFirms").value),durationMonths:parseInt(document.getElementById("abmDuration").value),numRegions:parseInt(document.getElementById("abmRegions").value),onProgress:De},t={initialUnemploymentRate:parseFloat(document.getElementById("abmInitialUR").value)/100,initialAIAdoption:parseFloat(document.getElementById("abmInitialAI").value)/100,adoptionCurve:document.getElementById("abmAdoptionCurve").value,automationPace:document.getElementById("abmAutomationPace").value},n=[];document.getElementById("abmUBI").checked&&n.push({type:"ubi",active:!0,monthlyAmount:1e3}),document.getElementById("abmRetraining").checked&&n.push({type:"retraining",active:!0,subsidyRate:.75,effectiveness:1.5}),document.getElementById("abmWageSubsidy").checked&&n.push({type:"wage_subsidy",active:!0,rate:.25,maxWage:4e3}),t.interventions=n,document.getElementById("abmProgress").style.display="block",document.getElementById("abmResults").style.display="none",document.getElementById("abmProgressBar").style.width="0%",document.getElementById("abmProgressPercent").textContent="0%",document.getElementById("abmProgressText").textContent="Initializing agents...";const a=e.numWorkers>=5e3&&typeof WorkerManager<"u"&&WorkerManager.isSupported();try{let o;a?o=await un(e,t):(O=new ABMSimulationEngine(e),o=await O.runSimulation(t)),Z=o,yn(o),b("ABM simulation complete!","success")}catch(o){console.error("ABM simulation failed:",o),b(`ABM simulation failed: ${o.message}`,"error"),document.getElementById("abmProgress").style.display="none"}}async function un(e,t){S&&S.terminate(),S=new WorkerManager,S.setProgressCallback(n=>{De({month:n.month,totalMonths:n.totalMonths,progress:n.progress,currentStats:n.currentStats})});try{return document.getElementById("abmProgressText").textContent="Starting Web Worker...",await S.initialize(e,t),document.getElementById("abmProgressText").textContent="Running simulation in background...",await S.runSimulation(t)}catch(n){return console.warn("Web Worker failed, falling back to main thread:",n),b("Worker unavailable, running on main thread...","info"),O=new ABMSimulationEngine(e),await O.runSimulation(t)}finally{S&&(S.terminate(),S=null)}}async function gn(){document.getElementById("abmWorkers").value=1e3,document.getElementById("abmWorkersValue").textContent="1,000",document.getElementById("abmFirms").value=50,document.getElementById("abmFirmsValue").textContent="50",document.getElementById("abmDuration").value=12,b("Running quick test with 1K workers, 50 firms, 12 months...","info"),await Le()}function De(e){const t=Math.round(e.month/e.totalMonths*100);document.getElementById("abmProgressBar").style.width=`${t}%`,document.getElementById("abmProgressPercent").textContent=`${t}%`,document.getElementById("abmCurrentMonth").textContent=e.month,document.getElementById("abmTotalMonths").textContent=e.totalMonths,t<10?document.getElementById("abmProgressText").textContent="Initializing labor market...":t<30?document.getElementById("abmProgressText").textContent="Simulating early AI adoption...":t<60?document.getElementById("abmProgressText").textContent="Processing workforce transitions...":t<90?document.getElementById("abmProgressText").textContent="Analyzing policy responses...":document.getElementById("abmProgressText").textContent="Finalizing results..."}function yn(e){document.getElementById("abmProgress").style.display="none",document.getElementById("abmResults").style.display="block";const t=e.summary;try{const n=(t.final.unemploymentRate*100).toFixed(1),a=(t.initial.unemploymentRate*100).toFixed(1),o=(n-a).toFixed(1);document.getElementById("abmFinalUR").textContent=`${n}%`,document.getElementById("abmURChange").textContent=`${o>=0?"+":""}${o}% from start`,document.getElementById("abmPeakUR").textContent=`${(t.peakUnemployment*100).toFixed(1)}%`,document.getElementById("abmPeakMonth").textContent=`Month ${t.peakUnemploymentMonth||"--"}`;const r=(t.final.aiAdoptionRate*100).toFixed(1),l=(t.initial.aiAdoptionRate*100).toFixed(1),i=(r-l).toFixed(1);document.getElementById("abmFinalAI").textContent=`${r}%`,document.getElementById("abmAIChange").textContent=`+${i}% from start`;const s=t.totalHires-t.totalLayoffs;document.getElementById("abmNetJobs").textContent=s.toLocaleString(),document.getElementById("abmNetJobs").style.color=s>=0?"var(--secondary)":"var(--danger)"}catch(n){console.error("Error displaying ABM summary cards:",n)}try{hn(e)}catch(n){console.error("Error displaying results interpretation:",n);const a=document.getElementById("abmInterpretationContent");a&&(a.innerHTML=`<p style="color: var(--danger);">Error loading interpretation: ${n.message}</p>`)}try{bn(t.finalPolicySupport,e)}catch(n){console.error("Error displaying policy support:",n);const a=document.getElementById("abmPolicySupportContent");a&&(a.innerHTML=`<p style="color: var(--danger);">Error loading policy support: ${n.message}</p>`)}try{In(e)}catch(n){console.error("Error rendering ABM charts:",n)}try{_n(t.emergentPatterns)}catch(n){console.error("Error displaying emergent patterns:",n);const a=document.getElementById("abmPatternsContent");a&&(a.innerHTML=`<p style="color: var(--danger);">Error loading patterns: ${n.message}</p>`)}try{$n(e)}catch(n){console.error("Error displaying demographics:",n);const a=document.getElementById("abmDemographicsContent");a&&(a.innerHTML=`<p style="color: var(--danger);">Error loading demographics: ${n.message}</p>`)}try{vn(e)}catch(n){console.error("Error displaying regional heat map:",n);const a=document.getElementById("regionalHeatmapContent");a&&(a.innerHTML=`<p style="color: var(--danger);">Error loading regional data: ${n.message}</p>`)}}function vn(e){if(typeof regionalHeatMap>"u"){console.warn("Regional heat map not available");return}regionalHeatMap.initialize(e),regionalHeatMap.renderSummaryPanel("regionalHeatmapSummary"),regionalHeatMap.render("regionalHeatmapContent","unemployment")}async function fn(){if(typeof abmSensitivity>"u"){alert("Sensitivity analysis module not available");return}const e=Fe(),t=document.getElementById("abmSensitivityProgress"),n=document.getElementById("abmSensitivityContent"),a=document.getElementById("sensitivityProgressText"),o=document.getElementById("sensitivityProgressBar"),r=document.getElementById("runSensitivityBtn");t.style.display="block",n.style.display="none",r.disabled=!0,r.textContent="Running...";const l=["initialAIAdoption","aiAdoptionSpeed","laborMarketFriction","retrainingEffectiveness","wageFlexibility"];try{const i=await abmSensitivity.runMultiParameterAnalysis(l,null,e,s=>{if(s.phase==="parameter")a.textContent=`Analyzing ${s.paramName}... (${s.current}/${s.total})`,o.style.width=`${s.current/s.total*100}%`;else{a.textContent=`${s.parameter}: ${s.current}/${s.total} simulations`;const c=(s.paramIndex-1)/s.paramTotal+s.current/s.total/s.paramTotal;o.style.width=`${c*100}%`}});abmSensitivity.renderDashboard("abmSensitivityContent",i)}catch(i){console.error("Sensitivity analysis error:",i),n.innerHTML=`<p style="color: var(--danger);">Error running sensitivity analysis: ${i.message}</p>`}t.style.display="none",n.style.display="block",r.disabled=!1,r.textContent="Run Analysis"}function Fe(){var e;return{numWorkers:1e3,numFirms:100,simulationMonths:parseInt(((e=document.getElementById("abmMonths"))==null?void 0:e.value)||60),initialAIAdoption:.2,aiAdoptionSpeed:1,laborMarketFriction:.1,retrainingEffectiveness:.3,wageFlexibility:.05,informationSpread:.1}}function bn(e,t=null){const n=document.getElementById("abmPolicySupportContent"),a={ubi:"Universal Basic Income",retraining:"Job Retraining Programs",wageSubsidy:"Wage Subsidies",reducedWorkWeek:"Reduced Work Week",publicWorks:"Public Works Programs",eitcExpansion:"EITC Expansion",aiRegulation:"AI Regulation",tradeProtection:"Trade Protection",educationInvestment:"Education Investment"},o={ubi:"💰",retraining:"📚",wageSubsidy:"💵",publicWorks:"🏗️",aiRegulation:"⚖️",educationInvestment:"🎓"},r=u=>{var x,w,C,P;if(!t||!t.policySupport||t.policySupport.length<6)return{value:0,direction:"stable"};const g=t.policySupport.slice(-6),f=((w=(x=g[0])==null?void 0:x[u])==null?void 0:w.mean)||.5,y=((((P=(C=g[g.length-1])==null?void 0:C[u])==null?void 0:P.mean)||.5)-f)*100;return{value:y.toFixed(1),direction:y>1?"increasing":y<-1?"decreasing":"stable"}},l=u=>u>=80?{label:"Highly Feasible",color:"var(--secondary)",icon:"✓✓"}:u>=65?{label:"Feasible",color:"var(--secondary)",icon:"✓"}:u>=50?{label:"Contested",color:"var(--warning)",icon:"~"}:u>=35?{label:"Difficult",color:"var(--warning)",icon:"!"}:{label:"Unlikely",color:"var(--danger)",icon:"✗"},i=u=>u.mean>.6&&(u.strongOppose||0)<.25;let s="";const c=Object.values(e).filter(u=>(u.feasibilityScore||u.mean*100)>=65).length,d=Object.keys(e).length;s+=`
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">
            <div style="background: linear-gradient(135deg, var(--primary), #8b5cf6); color: white; padding: 16px; border-radius: 12px; text-align: center;">
                <div style="font-size: 2rem; font-weight: 700;">${c}</div>
                <div style="font-size: 0.75rem; opacity: 0.9;">Feasible Policies</div>
            </div>
            <div style="background: linear-gradient(135deg, var(--secondary), #059669); color: white; padding: 16px; border-radius: 12px; text-align: center;">
                <div style="font-size: 2rem; font-weight: 700;">${Object.values(e).filter(u=>i(u)).length}</div>
                <div style="font-size: 0.75rem; opacity: 0.9;">Open Windows</div>
            </div>
            <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 16px; border-radius: 12px; text-align: center;">
                <div style="font-size: 2rem; font-weight: 700;">${Object.values(e).filter(u=>r(Object.keys(e).find(g=>e[g]===u)).direction==="increasing").length}</div>
                <div style="font-size: 0.75rem; opacity: 0.9;">Rising Support</div>
            </div>
            <div style="background: linear-gradient(135deg, #64748b, #475569); color: white; padding: 16px; border-radius: 12px; text-align: center;">
                <div style="font-size: 2rem; font-weight: 700;">${d}</div>
                <div style="font-size: 0.75rem; opacity: 0.9;">Policies Tracked</div>
            </div>
        </div>
    `,s+='<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">',Object.entries(e).forEach(([u,g])=>{const f=Math.round((g.mean||.5)*100),$=Math.round((g.strongSupport||0)*100),y=Math.round((g.strongOppose||0)*100),x=g.feasibilityScore||Math.round(g.mean*100),w=l(x),C=r(u),P=i(g),le=f>=60?"var(--secondary)":f>=40?"var(--warning)":"var(--danger)",Pe=o[u]||"📋";s+=`
            <div style="background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: 12px; padding: 20px; position: relative;">
                ${P?'<div style="position: absolute; top: 12px; right: 12px; background: var(--secondary); color: white; font-size: 0.65rem; padding: 4px 8px; border-radius: 12px; font-weight: 600;">WINDOW OPEN</div>':""}

                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                    <span style="font-size: 1.5rem;">${Pe}</span>
                    <div>
                        <div style="font-weight: 600; font-size: 0.95rem; color: var(--gray-800);">${a[u]||u}</div>
                        <div style="font-size: 0.75rem; color: ${w.color};">${w.icon} ${w.label}</div>
                    </div>
                </div>

                <!-- Support Gauge -->
                <div style="margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <span style="font-size: 0.75rem; color: var(--gray-500);">Public Support</span>
                        <span style="font-size: 1.25rem; font-weight: 700; color: ${le};">${f}%</span>
                    </div>
                    <div style="background: var(--gray-200); border-radius: 6px; height: 10px; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, var(--danger) 0%, var(--warning) 40%, var(--secondary) 60%, var(--secondary) 100%); height: 100%; width: 100%; position: relative;">
                            <div style="position: absolute; left: ${f}%; top: -2px; transform: translateX(-50%); width: 14px; height: 14px; background: white; border: 3px solid ${le}; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.65rem; color: var(--gray-400); margin-top: 4px;">
                        <span>Oppose</span>
                        <span>Neutral</span>
                        <span>Support</span>
                    </div>
                </div>

                <!-- Support Distribution -->
                <div style="display: flex; gap: 12px; margin-bottom: 12px;">
                    <div style="flex: 1; text-align: center; padding: 8px; background: rgba(16, 185, 129, 0.1); border-radius: 6px;">
                        <div style="font-size: 1.1rem; font-weight: 700; color: var(--secondary);">${$}%</div>
                        <div style="font-size: 0.65rem; color: var(--gray-500);">Strong Support</div>
                    </div>
                    <div style="flex: 1; text-align: center; padding: 8px; background: rgba(239, 68, 68, 0.1); border-radius: 6px;">
                        <div style="font-size: 1.1rem; font-weight: 700; color: var(--danger);">${y}%</div>
                        <div style="font-size: 0.65rem; color: var(--gray-500);">Strong Oppose</div>
                    </div>
                </div>

                <!-- Momentum Indicator -->
                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--gray-200);">
                    <span style="font-size: 0.75rem; color: var(--gray-500);">Momentum</span>
                    <span style="font-size: 0.85rem; font-weight: 600; color: ${C.direction==="increasing"?"var(--secondary)":C.direction==="decreasing"?"var(--danger)":"var(--gray-500)"};">
                        ${C.direction==="increasing"?"↑":C.direction==="decreasing"?"↓":"→"}
                        ${C.value>0?"+":""}${C.value}%
                        <span style="font-weight: 400; color: var(--gray-400);">/ 6mo</span>
                    </span>
                </div>
            </div>
        `}),s+="</div>";const m=Object.entries(e).filter(([u,g])=>i(g));m.length>0&&(s+=`
            <div style="margin-top: 24px; padding: 20px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05)); border: 1px solid var(--secondary); border-radius: 12px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <span style="font-size: 1.25rem;">🪟</span>
                    <h4 style="margin: 0; color: var(--secondary);">Policy Windows Open</h4>
                </div>
                <p style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 16px;">
                    The following policies have sufficient public support and manageable opposition for implementation:
                </p>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${m.map(([u,g])=>`
                        <span style="background: var(--secondary); color: white; padding: 8px 16px; border-radius: 20px; font-size: 0.875rem; font-weight: 500;">
                            ${o[u]||"📋"} ${a[u]||u}
                            <span style="opacity: 0.8;">(${Math.round(g.mean*100)}%)</span>
                        </span>
                    `).join("")}
                </div>
            </div>
        `),n.innerHTML=s}function hn(e){const t=document.getElementById("abmInterpretationContent"),n=document.getElementById("abmInterpretationDetails");if(typeof resultsInterpreter>"u"){t.innerHTML='<p style="color: var(--gray-500);">Results interpreter not available</p>';return}const a=xn(e),o=resultsInterpreter.interpret(a);if(o.error){t.innerHTML=`<p style="color: var(--danger);">${o.error}</p>`;return}let r="";const l=o.overview,i={positive:{bg:"rgba(16, 185, 129, 0.1)",border:"var(--secondary)",icon:"✅"},neutral:{bg:"rgba(100, 116, 139, 0.1)",border:"var(--gray-400)",icon:"➡️"},negative:{bg:"rgba(245, 158, 11, 0.1)",border:"var(--warning)",icon:"⚠️"},critical:{bg:"rgba(239, 68, 68, 0.1)",border:"var(--danger)",icon:"🚨"}},s=i[l.outlook]||i.neutral;r+=`
        <div style="background: ${s.bg}; border-left: 4px solid ${s.border}; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <span style="font-size: 1.5rem;">${s.icon}</span>
                <div>
                    <div style="font-weight: 700; font-size: 1.1rem; color: var(--gray-800);">${l.headline}</div>
                    <div style="font-size: 0.875rem; color: var(--gray-600);">${l.subheadline}</div>
                </div>
            </div>
        </div>
    `;const c=o.keyFindings.slice(0,4);r+='<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;">',c.forEach(y=>{const x={positive:"var(--secondary)",critical:"var(--danger)",high:"var(--danger)",warning:"var(--warning)",neutral:"var(--gray-500)",moderate:"var(--warning)",low:"var(--secondary)"};x[y.severity]||x[y.impact],r+=`
            <div style="display: flex; align-items: center; gap: 10px; padding: 12px; background: var(--gray-50); border-radius: 8px;">
                <span style="font-size: 1.25rem;">${y.icon}</span>
                <div>
                    <div style="font-size: 0.875rem; color: var(--gray-700);">${y.finding}</div>
                </div>
            </div>
        `}),r+="</div>";const d=o.riskAssessment,m={critical:{bg:"var(--danger)",text:"white"},high:{bg:"var(--warning)",text:"white"},medium:{bg:"#fbbf24",text:"var(--gray-800)"},low:{bg:"var(--secondary)",text:"white"}},u=m[d.overallLevel]||m.medium;r+=`
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px; background: var(--gray-50); border-radius: 8px;">
            <div>
                <div style="font-size: 0.875rem; color: var(--gray-500); margin-bottom: 4px;">Overall Risk Assessment</div>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="background: ${u.bg}; color: ${u.text}; padding: 4px 12px; border-radius: 20px; font-size: 0.875rem; font-weight: 600; text-transform: uppercase;">${d.overallLevel}</span>
                    <span style="color: var(--gray-600); font-size: 0.875rem;">Score: ${d.overallScore}/100</span>
                </div>
            </div>
            <div style="text-align: right;">
                ${d.riskCount.critical>0?`<span style="color: var(--danger); font-weight: 600;">${d.riskCount.critical} Critical</span> `:""}
                ${d.riskCount.high>0?`<span style="color: var(--warning); font-weight: 600;">${d.riskCount.high} High</span> `:""}
                ${d.riskCount.medium>0?`<span style="color: var(--gray-500);">${d.riskCount.medium} Medium</span>`:""}
            </div>
        </div>
    `,t.innerHTML=r;let g="";g+=`
        <div style="margin-bottom: 24px;">
            <h4 style="margin-bottom: 12px; color: var(--gray-700);">📝 Narrative Summary</h4>
            <p style="color: var(--gray-600); line-height: 1.6; font-size: 0.925rem;">${o.narrativeSummary}</p>
        </div>
    `,d.risks.length>0&&(g+=`
            <div style="margin-bottom: 24px;">
                <h4 style="margin-bottom: 12px; color: var(--gray-700);">⚠️ Identified Risks</h4>
                <div style="display: grid; gap: 12px;">
        `,d.risks.forEach(y=>{const x=y.level==="critical"?"var(--danger)":y.level==="high"?"var(--warning)":"var(--gray-500)";g+=`
                <div style="padding: 16px; background: var(--gray-50); border-radius: 8px; border-left: 3px solid ${x};">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-weight: 600; color: var(--gray-700);">${y.type.replace(/_/g," ").replace(/\b\w/g,w=>w.toUpperCase())}</span>
                        <span style="color: ${x}; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">${y.level}</span>
                    </div>
                    <p style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 8px;">${y.description}</p>
                    <p style="font-size: 0.8rem; color: var(--primary);">💡 ${y.mitigation}</p>
                </div>
            `}),g+="</div></div>");const f=o.policyRecommendations.slice(0,5);g+=`
        <div style="margin-bottom: 24px;">
            <h4 style="margin-bottom: 12px; color: var(--gray-700);">📋 Policy Recommendations</h4>
            <div style="display: grid; gap: 12px;">
    `,f.forEach(y=>{const x={high:{bg:"var(--danger)",text:"HIGH PRIORITY"},medium:{bg:"var(--warning)",text:"MEDIUM"},standard:{bg:"var(--gray-400)",text:"STANDARD"}},w=x[y.priority]||x.standard;g+=`
            <div style="padding: 16px; background: var(--gray-50); border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                    <span style="font-weight: 600; color: var(--gray-700);">${y.title}</span>
                    <span style="background: ${w.bg}; color: white; font-size: 0.65rem; padding: 2px 8px; border-radius: 10px;">${w.text}</span>
                </div>
                <p style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 6px;">${y.description}</p>
                <p style="font-size: 0.8rem; color: var(--secondary);">Expected: ${y.expectedImpact}</p>
            </div>
        `}),g+="</div></div>";const $=o.comparativeBenchmarks;g+=`
        <div style="margin-bottom: 24px;">
            <h4 style="margin-bottom: 12px; color: var(--gray-700);">📊 Comparative Benchmarks</h4>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                <div style="padding: 16px; background: var(--gray-50); border-radius: 8px;">
                    <div style="font-size: 0.875rem; font-weight: 600; color: var(--gray-700); margin-bottom: 12px;">Unemployment Comparison</div>
                    ${$.unemploymentBenchmarks.map(y=>`
                        <div style="display: flex; justify-content: space-between; padding: 6px 0; ${y.current?"font-weight: 600; color: var(--primary);":"color: var(--gray-600);"}">
                            <span>${y.label}</span>
                            <span>${y.value}%</span>
                        </div>
                    `).join("")}
                </div>
                <div style="padding: 16px; background: var(--gray-50); border-radius: 8px;">
                    <div style="font-size: 0.875rem; font-weight: 600; color: var(--gray-700); margin-bottom: 12px;">Displacement Comparison</div>
                    ${$.displacementBenchmarks.map(y=>`
                        <div style="display: flex; justify-content: space-between; padding: 6px 0; ${y.current?"font-weight: 600; color: var(--primary);":"color: var(--gray-600);"}">
                            <span>${y.label}</span>
                            <span>${y.value}</span>
                        </div>
                    `).join("")}
                </div>
            </div>
            <p style="font-size: 0.875rem; color: var(--gray-500); margin-top: 12px; text-align: center;">${$.context}</p>
        </div>
    `,n.innerHTML=g}function xn(e){const t=e.summary;return{summary:{labor_market_changes:{unemployment_rate:{initial:t.initial.unemploymentRate*100,final:t.final.unemploymentRate*100,change:(t.final.unemploymentRate-t.initial.unemploymentRate)*100},total_employment:{initial:t.initial.totalEmployed||15e7,final:t.final.totalEmployed||15e7,change:(t.final.totalEmployed||0)-(t.initial.totalEmployed||0)}},ai_impact:{ai_adoption:{initial:t.initial.aiAdoptionRate*100,final:t.final.aiAdoptionRate*100},cumulative_displacement:t.totalLayoffs||0,cumulative_new_jobs:t.totalHires||0,net_impact:(t.totalHires||0)-(t.totalLayoffs||0)},wages:{average_hourly:{initial:30,final:30*(1+(t.wageChange||0)),change_percent:(t.wageChange||0)*100}},productivity:{growth_rate:{initial:1.5,final:t.final.productivityGrowth||2.5}},inequality:t.inequality||null,sectorImpacts:t.sectorImpacts||null},scenario:e.scenario||{name:"Custom Scenario",timeframe:{start_year:2024,end_year:2029}},monthlyData:e.monthlyData||[],policySupport:e.policySupport||[]}}function wn(){const e=document.getElementById("abmInterpretationDetails"),t=event.target;e.style.display==="none"?(e.style.display="block",t.textContent="Hide Details"):(e.style.display="none",t.textContent="Show Details")}function In(e){Object.values(T).forEach(i=>i.destroy()),T={};const t=e.monthlyData.map((i,s)=>`Month ${s+1}`),n=document.getElementById("abmUnemploymentChart").getContext("2d");T.unemployment=new Chart(n,{type:"line",data:{labels:t,datasets:[{label:"Unemployment Rate",data:e.monthlyData.map(i=>i.unemploymentRate*100),borderColor:"#ef4444",backgroundColor:"rgba(239, 68, 68, 0.1)",fill:!0,tension:.4}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}},scales:{y:{beginAtZero:!0,title:{display:!0,text:"Unemployment Rate (%)"}}}}});const a=document.getElementById("abmPolicySupportChart").getContext("2d"),o=["ubi","retraining","aiRegulation"],r=["#6366f1","#10b981","#f59e0b"];T.policySupport=new Chart(a,{type:"line",data:{labels:t,datasets:o.map((i,s)=>({label:i==="ubi"?"UBI":i==="retraining"?"Retraining":"AI Regulation",data:e.monthlyData.map(c=>{var d,m;return((m=(d=c.policySupport)==null?void 0:d[i])==null?void 0:m.mean)*100||50}),borderColor:r[s],backgroundColor:"transparent",tension:.4}))},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{position:"top"}},scales:{y:{min:0,max:100,title:{display:!0,text:"Support (%)"}}}}});const l=document.getElementById("abmAIAdoptionChart").getContext("2d");T.aiAdoption=new Chart(l,{type:"line",data:{labels:t,datasets:[{label:"AI Adoption Rate",data:e.monthlyData.map(i=>i.aiAdoptionRate*100),borderColor:"#8b5cf6",backgroundColor:"rgba(139, 92, 246, 0.1)",fill:!0,tension:.4}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}},scales:{y:{beginAtZero:!0,title:{display:!0,text:"AI Adoption (%)"}}}}})}function _n(e){const t=document.getElementById("abmPatternsContent");if(!e||e.length===0){t.innerHTML='<p style="color: var(--gray-500);">No significant emergent patterns detected in this simulation.</p>';return}let n='<div style="display: flex; flex-direction: column; gap: 12px;">';e.forEach(a=>{const o=a.type==="tipping_point"?"⚠️":a.type==="feedback_loop"?"🔄":a.type==="cascade"?"📉":"📊",r=a.severity||"medium";n+=`
            <div style="background: var(--gray-50); border-radius: 8px; padding: 16px; border-left: 4px solid ${r==="high"?"var(--danger)":r==="medium"?"var(--warning)":"var(--gray-500)"};">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 1.25rem;">${o}</span>
                    <span style="font-weight: 600;">${a.type.replace(/_/g," ").replace(/\b\w/g,i=>i.toUpperCase())}</span>
                    <span style="margin-left: auto; font-size: 0.75rem; color: var(--gray-500);">Month ${a.month||"--"}</span>
                </div>
                <p style="margin: 0; color: var(--text-secondary); font-size: 0.875rem;">${a.description||""}</p>
            </div>
        `}),n+="</div>",t.innerHTML=n}function $n(e){var r;const t=document.getElementById("abmDemographicsContent"),n=e.monthlyData[e.monthlyData.length-1],a=e.summary.finalPolicySupport;let o=`
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;">
            <div>
                <h5 style="margin-bottom: 12px; color: var(--primary);">Employment Status Breakdown</h5>
                <div style="background: var(--gray-50); border-radius: 8px; padding: 16px;">
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--gray-200);">
                        <span>Employed</span>
                        <span style="font-weight: 600; color: var(--secondary);">${((1-n.unemploymentRate)*100).toFixed(1)}%</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--gray-200);">
                        <span>Unemployed</span>
                        <span style="font-weight: 600; color: var(--danger);">${(n.unemploymentRate*100).toFixed(1)}%</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                        <span>In Retraining</span>
                        <span style="font-weight: 600; color: var(--primary);">${(n.retrainingRate*100||0).toFixed(1)}%</span>
                    </div>
                </div>
            </div>

            <div>
                <h5 style="margin-bottom: 12px; color: var(--primary);">Top Policy Priorities</h5>
                <div style="background: var(--gray-50); border-radius: 8px; padding: 16px;">
                    ${Object.entries(a).sort((l,i)=>i[1].mean-l[1].mean).slice(0,3).map(([l,i],s)=>`
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; ${s<2?"border-bottom: 1px solid var(--gray-200);":""}">
                                <span>${l.replace(/([A-Z])/g," $1").replace(/^./,c=>c.toUpperCase())}</span>
                                <span style="font-weight: 600; color: var(--primary);">${Math.round(i.mean*100)}%</span>
                            </div>
                        `).join("")}
                </div>
            </div>
        </div>

        <div style="margin-top: 24px;">
            <h5 style="margin-bottom: 12px; color: var(--primary);">Simulation Summary</h5>
            <div style="background: var(--gray-50); border-radius: 8px; padding: 16px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; text-align: center;">
                <div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--secondary);">${e.summary.totalHires.toLocaleString()}</div>
                    <div style="font-size: 0.75rem; color: var(--gray-500);">Total Hires</div>
                </div>
                <div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--danger);">${e.summary.totalLayoffs.toLocaleString()}</div>
                    <div style="font-size: 0.75rem; color: var(--gray-500);">Total Layoffs</div>
                </div>
                <div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">${((r=e.summary.emergentPatterns)==null?void 0:r.length)||0}</div>
                    <div style="font-size: 0.75rem; color: var(--gray-500);">Patterns Found</div>
                </div>
                <div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--warning);">${e.monthlyData.length}</div>
                    <div style="font-size: 0.75rem; color: var(--gray-500);">Months Simulated</div>
                </div>
            </div>
        </div>
    `;t.innerHTML=o}function En(){if(!Z){b("No ABM results to export. Run a simulation first.","warning");return}const e=new Blob([JSON.stringify(Z,null,2)],{type:"application/json"}),t=URL.createObjectURL(e),n=document.createElement("a");n.href=t,n.download=`abm-simulation-${new Date().toISOString().split("T")[0]}.json`,n.click(),URL.revokeObjectURL(t),b("ABM results exported!","success")}document.addEventListener("keydown",e=>{e.key==="Enter"&&document.getElementById("passwordModal").style.display==="flex"&&Me(),e.key==="Escape"&&(re(),Te(),ze())});document.addEventListener("DOMContentLoaded",()=>{setTimeout(se,500)});en();typeof window<"u"&&!window.__VITE_MODULE_LOADED__&&document.addEventListener("DOMContentLoaded",me);typeof window<"u"&&(window.__VITE_MODULE_LOADED__=!0);typeof window<"u"&&(window.initApp=me,window.showSection=pe,window.loadPreset=Ye,window.runSimulation=Ge,window.getCurrentScenario=Je,window.toggleTargetOptimizer=qe,window.optimizeInterventions=Ze,window.applyOptimizedInterventions=et,window.downloadPDFReport=it,window.showInterventionModal=ot,window.hideInterventionModal=ue,window.updateInterventionParams=ge,window.addIntervention=rt,window.quickAddIntervention=st,window.toggleIntervention=lt,window.removeIntervention=dt,window.exportResults=ct,window.exportAsPDF=ye,window.exportAsJSON=ve,window.resetSimulation=mt,window.resetToDefaults=X,window.resetEverything=Nt,window.resetToBaselineData=Ot,window.saveSimulation=pt,window.loadSavedSimulation=ut,window.deleteSavedSimulation=gt,window.showSavedSimulationsModal=yt,window.hideSavedSimulationsModal=Q,window.clearAllSavedSimulations=vt,window.renderHypotheticalIndicators=B,window.updateIndicatorValue=ft,window.resetIndicator=bt,window.resetAllHypotheticalIndicators=ht,window.showIndicatorDetails=xt,window.toggleSourcesDetails=wt,window.showCustomIndicatorModal=It,window.hideCustomIndicatorModal=fe,window.saveCustomIndicator=_t,window.deleteCustomIndicator=$t,window.generateAISummary=he,window.regenerateAISummary=Et,window.runAdvancedAISimulation=on,window.showPasswordModal=ke,window.hidePasswordModal=re,window.submitAIPassword=Me,window.showAIAnalysis=dn,window.hideAIResultsModal=ze,window.showTrainingModal=cn,window.hideTrainingModal=Te,window.trainModel=mn,window.exportTrainingData=pn,window.renderComparisonView=Y,window.addToComparison=Ct,window.clearAllComparisons=St,window.removeFromComparison=At,window.renderOccupationList=te,window.showOccupationDetails=kt,window.hideOccupationDetails=Mt,window.renderSensitivityOverview=xe,window.runParameterSensitivity=Bt,window.initializeSettings=we,window.updateApiStatus=Ht,window.fetchLiveData=Ut,window.shareSimulation=Wt,window.showShareButton=ae,window.runMonteCarloAnalysis=Yt,window.openMobileMenu=Gt,window.closeMobileMenu=Ie,window.showHistoryModal=qt,window.hideHistoryModal=_e,window.loadFromHistory=Kt,window.deleteFromHistory=Zt,window.clearAllHistory=Xt,window.toggleTheme=Qt,window.showNotification=b,window.runABMSimulation=Le,window.runQuickABMTest=gn,window.runABMSensitivityAnalysis=fn,window.getABMConfig=Fe,window.toggleInterpretationDetails=wn,window.exportABMResults=En);export{L as escapeHtml,Je as getCurrentScenario,me as initApp,Ye as loadPreset,Ge as runSimulation,pe as showSection};
//# sourceMappingURL=app-K7V0Ylxr.js.map
