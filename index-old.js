
// do not use - this is my testing harness.

import testCall from './lib/basicFetch.js';
import addServiceNowAction from './lib/addSNaction.js';

console.log("Hello fucking World");

testCall();

const newAction = {
    parent: "ce06dde6c35a0710d93ab813e401312c",
    short_description: "Test action for 2nd harness call",
    description: "Review the full harness call and make sure it is working correctly and check that it created 1020",
    work_notes: "This is the 1st iteration of the 2nd action for the harness call",
    created_by: "admin",
    assigned_to: "admin",
    action_due_date: "2026-10-01",
    priority: 1,
    state: 1
};

const actionRecord = await addServiceNowAction({ table: 'project_action', body: newAction });
console.log(actionRecord);

