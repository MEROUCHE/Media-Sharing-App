package com.idk.Media_Sharing_App.group;

public class CreatorCannotLeaveException extends RuntimeException {
    public CreatorCannotLeaveException() {
        super("Creator cannot leave — delete the group instead");
    }
}