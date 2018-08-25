// ########################################################
// ########################################################

//            Google Drive Courseware Script
//
//   Run this script to populate your Google Drive with
//   folders that replicate a Courseware structure.
//
//   This script requires 2 files to exist in the root
//   of your Google Drive. One for a list of students,
//   and one for a list of TAs, named like so:
//
//    course.section.csv    (example: CSE12345.01.csv)
//    course.section.ta.csv (example: CSE12345.01.ta.csv)
//
//   The CSV files must contain rows of records with only
//   1 column, the NetID. Like so:
//
//    netid01
//    netid02
//    netid03
//
//   Since the students will only see the shared folder,
//   not the parent folder hierarchy created for faculty,
//   this script will create their individual folders
//   with convenient names that appear like so:
//
//    2018.Fa.CSE12345.01.netid
//

// ########################################################
//      Edit below this with your course information
// ########################################################


var shareFolders = false;  // Setting this to true will send emails.

var courseName = "CSE12345.01";  // Course.Section
var year = "2018";
//   Fa = Fall
//   Sp = Spring
//   Su = Summer
var semester = "Fa";  // Use codes above

// Optionally get students from Google Group. Leave blank to read from CSV file.
// var groupEmail = "";


// ########################################################
//       It is not necessary to edit below this line
// ########################################################

var csvFileName = courseName + '.csv';
var taFileName = courseName + '.ta.csv';
var studentData;
var taData;

function main() {
  // See if these folders already exist. If not, create them. If so, return pointers to them.
  // We need to start out with a FolderIterator object for the first folder (Courseware),
  // since it spawns from the DriveApp object, not a random folder object like the others.
  var cwIterator = DriveApp.getFoldersByName("Courseware");
  var cwFolder = createCourseware(cwIterator);
  var yearFolder = createDir(year, cwFolder);
  var courseFolder = createDir(courseName, yearFolder);
  // Import the TAs and add them to the course folder if sharing is enabled.
  taData = importCSV(taFileName);
  if (shareFolders == true) {
    shareWithTAs(taData, courseFolder);
  }
  // Import the NetIDs and then create folders for each student.
  if (groupEmail == '') {
    studentData = importCSV(csvFileName);
  } else {
    studentData = getMembers(groupEmail);
  }
  createStudents(studentData, courseFolder);
}

function getMembers(groupEmail) {
  group = GroupsApp.getGroupByEmail(groupEmail);
  members = group.getUsers();
  return members;
}

function createCourseware(i) {
  // Takes the FolderIterator object and checks to see if a "Courseware" object exists within.
  if (i.hasNext()) { // If folder exists
    var tmp = i.next();
    if (tmp.getName() == "Courseware") {
      return tmp; // Return folder pointer.
    }
  } else {
    // Doesn't exist, create in the Drive Root and return pointer.
    return DriveApp.createFolder("Courseware");
  }
}

// Generic Directory Creator. Checks to see if it exists first.
function createDir(folderName, parentFolder) {
  // Get Iterator Object for Parent Folder.
  var pi = parentFolder.getFoldersByName(folderName);
  if (pi.hasNext()) {  // If folder exists
    var tmp = pi.next()
    if (tmp.getName() == folderName) {
      return tmp; // Return pointer to existing object
    }
  } else {
    // Doesn't exist, create in the parent and return pointer.
    return parentFolder.createFolder(folderName);
  }
}

// Get data from CSV and save it in the csvData variable.
function importCSV(csvFileName) {
  var file = DriveApp.getFilesByName(csvFileName).next();
  var csvData1 = Utilities.parseCsv(file.getBlob().getDataAsString());
  var arrayData =[];
  for (var i = 0; i < csvData1.length; i++) {
    var netID = csvData1[i][0]; // netID is the first column of the csv data
    arrayData.push(netID + "@nd.edu");
   }
  return arrayData;
}

// Create student directories in the courseFolder
function createStudents(studentData, courseFolder) {
  for (var i = 0; i < studentData.length; i++) {
    var netID = studentData[i]; // netID is the first column of the csv data
//    Logger.log("Item: " + netID);
    var regExp = new RegExp("[a-z0-9]+","i");
    var tmpNetID = regExp.exec(studentData[i]); // extract NetID from the email address

    var tmpName = year + "." + semester + "." + courseName + "." + tmpNetID;
    var studentDir = createDir(tmpName, courseFolder);

    // Control who can share these folders. We don't want the students to have too much control.
    studentDir.setShareableByEditors(false);

    // If we're doing this live, share the folders with the students and TAs.
    // If we're just testing the folder structure, skip, as it will generate a lot of emails.
    if (shareFolders == true) {
      // Grants Editor permissions to both the students and the TAs.
      shareWithStudent(netID, studentDir);
    }
  }
}

function shareWithStudent(netID, studentDir) {
  // Check to see if Student already has share permissions
  var perms = studentDir.getAccess(netID);
  if ((perms == DriveApp.Permission.NONE) || (perms == DriveApp.Permission.VIEW) || (perms == DriveApp.Permission.COMMENT)) {
    studentDir.addEditor(netID);
  }
}

function shareWithTAs(TAs, courseDir) {
  var arrayLength = TAs.length;
  for (var i = 0; i < arrayLength; i++) {
    // Check to see if TA already has share permissions
    var perms = courseDir.getAccess(TAs[i]);
    if ((perms == DriveApp.Permission.NONE) || (perms == DriveApp.Permission.VIEW) || (perms == DriveApp.Permission.COMMENT)) {
      courseDir.addEditor(TAs[i]);
    }
  }
}
